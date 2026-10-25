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
[Route("api")]
[Authorize]
public class PermissionsController : ControllerBase
{
    private readonly TrustVaultDbContext _db;
    private readonly PermissionService _perms;
    private readonly AuditService _audit;
    public PermissionsController(TrustVaultDbContext db, PermissionService perms, AuditService audit)
    {
        _db = db; _perms = perms; _audit = audit;
    }

    private Guid CurrentUserId() => Guid.Parse((User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value)!);
    private string CurrentRole() => User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value ?? "Viewer";
    private string CurrentEmail() => User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value ?? string.Empty;

    [HttpGet("documents/{documentId:guid}/permissions")]
    public async Task<IActionResult> List(Guid documentId)
    {
        var userId = CurrentUserId();
        var role = CurrentRole();
        if (!await _perms.IsOwnerOrAdminAsync(userId, role, documentId))
            return Forbid();

        var perms = await _db.DocumentPermissions
            .Include(p => p.User)
            .Where(p => p.DocumentId == documentId)
            .OrderByDescending(p => p.GrantedAt)
            .ToListAsync();

        return Ok(perms.Select(p => new
        {
            p.Id,
            p.DocumentId,
            p.UserId,
            UserEmail = p.User?.Email,
            UserName = p.User?.DisplayName,
            p.Level,
            p.GrantedAt,
            p.ExpiresAt,
            p.RevokedAt,
            p.IsActive
        }));
    }

    [HttpPost("permissions")]
    public async Task<IActionResult> Grant([FromBody] CreatePermissionRequest req)
    {
        var userId = CurrentUserId();
        var role = CurrentRole();
        if (!await _perms.IsOwnerOrAdminAsync(userId, role, req.DocumentId))
        {
            await _audit.LogAsync(userId, CurrentEmail(), "PermissionGrant", req.DocumentId, null, "Denied", "No permission");
            return Forbid();
        }
        var targetUser = await _db.Users.FindAsync(req.UserId);
        if (targetUser == null) return BadRequest(new { message = "User not found." });
        if (req.Level != "Read" && req.Level != "Edit") return BadRequest(new { message = "Invalid level." });

        var perm = new DocumentPermission
        {
            DocumentId = req.DocumentId,
            UserId = req.UserId,
            Level = req.Level,
            ExpiresAt = req.ExpiresAt
        };
        _db.DocumentPermissions.Add(perm);
        await _db.SaveChangesAsync();
        var doc = await _db.Documents.FindAsync(req.DocumentId);
        await _audit.LogAsync(userId, CurrentEmail(), "PermissionGrant", req.DocumentId, doc?.Name, "Success", $"Granted {req.Level} to {targetUser.Email}");
        return Ok(new
        {
            perm.Id, perm.DocumentId, perm.UserId,
            UserEmail = targetUser.Email, UserName = targetUser.DisplayName,
            perm.Level, perm.GrantedAt, perm.ExpiresAt, perm.RevokedAt, perm.IsActive
        });
    }

    [HttpPost("permissions/{id:guid}/revoke")]
    public async Task<IActionResult> Revoke(Guid id)
    {
        var userId = CurrentUserId();
        var role = CurrentRole();
        var perm = await _db.DocumentPermissions.Include(p => p.Document).FirstOrDefaultAsync(p => p.Id == id);
        if (perm == null) return NotFound();
        if (!await _perms.IsOwnerOrAdminAsync(userId, role, perm.DocumentId))
        {
            await _audit.LogAsync(userId, CurrentEmail(), "PermissionRevoke", perm.DocumentId, perm.Document?.Name, "Denied", "No permission");
            return Forbid();
        }
        perm.RevokedAt = DateTime.UtcNow;
        perm.IsActive = false;
        await _db.SaveChangesAsync();
        await _audit.LogAsync(userId, CurrentEmail(), "PermissionRevoke", perm.DocumentId, perm.Document?.Name, "Success", $"Revoked permission {id}");
        return NoContent();
    }

    [HttpPatch("permissions/{id:guid}/expiry")]
    public async Task<IActionResult> UpdateExpiry(Guid id, [FromBody] UpdateExpiryRequest req)
    {
        var userId = CurrentUserId();
        var role = CurrentRole();
        var perm = await _db.DocumentPermissions.Include(p => p.Document).FirstOrDefaultAsync(p => p.Id == id);
        if (perm == null) return NotFound();
        if (!await _perms.IsOwnerOrAdminAsync(userId, role, perm.DocumentId))
        {
            await _audit.LogAsync(userId, CurrentEmail(), "PermissionExpiryUpdate", perm.DocumentId, perm.Document?.Name, "Denied", "No permission");
            return Forbid();
        }
        perm.ExpiresAt = req.ExpiresAt;
        await _db.SaveChangesAsync();
        await _audit.LogAsync(userId, CurrentEmail(), "PermissionExpiryUpdate", perm.DocumentId, perm.Document?.Name, "Success", $"Set expiry {req.ExpiresAt}");
        return NoContent();
    }
}
