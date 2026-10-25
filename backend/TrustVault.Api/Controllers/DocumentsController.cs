using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TrustVault.Api.Data;
using TrustVault.Api.DTOs;
using TrustVault.Api.Models;
using TrustVault.Api.Services;

namespace TrustVault.Api.Controllers;

[ApiController]
[Route("api/documents")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly TrustVaultDbContext _db;
    private readonly PermissionService _perms;
    private readonly AuditService _audit;
    private readonly IWebHostEnvironment _env;
    private const long MaxFileSize = 10 * 1024 * 1024;
    private static readonly HashSet<string> AllowedTypes = new(StringComparer.OrdinalIgnoreCase)
    { "application/pdf", "text/plain", "image/png", "image/jpeg", "application/json" };

    public DocumentsController(TrustVaultDbContext db, PermissionService perms, AuditService audit, IWebHostEnvironment env)
    {
        _db = db; _perms = perms; _audit = audit; _env = env;
    }

    private Guid CurrentUserId()
    {
        var v = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        return Guid.Parse(v!);
    }
    private string CurrentRole() => User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value ?? "Viewer";
    private string CurrentEmail() => User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value ?? string.Empty;

    [HttpGet]
    public async Task<IActionResult> List()
    {
        var userId = CurrentUserId();
        var role = CurrentRole();
        List<Document> docs;
        if (role == "Admin")
        {
            docs = await _db.Documents.Include(d => d.Owner).OrderByDescending(d => d.UploadedAt).ToListAsync();
        }
        else
        {
            var permittedIds = await _db.DocumentPermissions
                .Where(p => p.UserId == userId && p.IsActive && p.RevokedAt == null && (p.ExpiresAt == null || p.ExpiresAt > DateTime.UtcNow))
                .Select(p => p.DocumentId).ToListAsync();
            docs = await _db.Documents.Include(d => d.Owner)
                .Where(d => d.OwnerId == userId || permittedIds.Contains(d.Id))
                .OrderByDescending(d => d.UploadedAt).ToListAsync();
        }
        return Ok(docs.Select(d => new
        {
            d.Id, d.Name, d.OriginalFileName, d.ContentType, d.SizeBytes, d.OwnerId,
            OwnerName = d.Owner?.DisplayName, d.UploadedAt, d.Description, d.Tags
        }));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var userId = CurrentUserId();
        var role = CurrentRole();
        if (!await _perms.CanReadAsync(userId, role, id))
        {
            await _audit.LogAsync(userId, CurrentEmail(), "DocumentRead", id, null, "Denied", "No permission");
            return Forbid();
        }
        var doc = await _db.Documents.Include(d => d.Owner).FirstOrDefaultAsync(d => d.Id == id);
        if (doc == null) return NotFound();
        return Ok(new
        {
            doc.Id, doc.Name, doc.OriginalFileName, doc.ContentType, doc.SizeBytes, doc.OwnerId,
            OwnerName = doc.Owner?.DisplayName, doc.UploadedAt, doc.Description, doc.Tags
        });
    }

    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> Upload([FromForm] UploadDocumentRequest req)
    {
        var file = req.File;
        var userId = CurrentUserId();
        if (file == null || file.Length == 0) return BadRequest(new { message = "File is required." });
        if (file.Length > MaxFileSize) return BadRequest(new { message = "File too large." });
        if (!AllowedTypes.Contains(file.ContentType)) return BadRequest(new { message = "File type not allowed." });

        var safeName = string.IsNullOrWhiteSpace(req.Name) ? Path.GetFileName(file.FileName) : req.Name.Trim();
        var docId = Guid.NewGuid();
        var storageRoot = Path.Combine(_env.ContentRootPath, "storage", "documents", userId.ToString());
        Directory.CreateDirectory(storageRoot);
        var storagePath = Path.Combine(storageRoot, $"{docId}_{Path.GetFileName(file.FileName)}");
        using (var stream = System.IO.File.Create(storagePath))
        {
            await file.CopyToAsync(stream);
        }

        var doc = new Document
        {
            Id = docId,
            Name = safeName,
            OriginalFileName = file.FileName,
            ContentType = file.ContentType,
            SizeBytes = file.Length,
            OwnerId = userId,
            Description = req.Description,
            Tags = req.Tags,
            StoragePath = storagePath
        };
        _db.Documents.Add(doc);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(userId, CurrentEmail(), "DocumentUpload", doc.Id, doc.Name, "Success", null);
        var ownerName = (await _db.Users.FindAsync(userId))?.DisplayName;
        return Ok(new
        {
            doc.Id, doc.Name, doc.OriginalFileName, doc.ContentType, doc.SizeBytes, doc.OwnerId,
            OwnerName = ownerName, doc.UploadedAt, doc.Description, doc.Tags
        });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = CurrentUserId();
        var role = CurrentRole();
        if (!await _perms.IsOwnerOrAdminAsync(userId, role, id))
        {
            await _audit.LogAsync(userId, CurrentEmail(), "DocumentDelete", id, null, "Denied", "No permission");
            return Forbid();
        }
        var doc = await _db.Documents.FindAsync(id);
        if (doc == null) return NotFound();
        if (System.IO.File.Exists(doc.StoragePath)) System.IO.File.Delete(doc.StoragePath);
        _db.Documents.Remove(doc);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(userId, CurrentEmail(), "DocumentDelete", id, doc.Name, "Success", null);
        return NoContent();
    }
}
