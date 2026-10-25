using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TrustVault.Api.Data;

namespace TrustVault.Api.Controllers;

[ApiController]
[Route("api/audit")]
[Authorize]
public class AuditController : ControllerBase
{
    private readonly TrustVaultDbContext _db;
    public AuditController(TrustVaultDbContext db) => _db = db;

    private Guid CurrentUserId() => Guid.Parse((User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value)!);
    private string CurrentRole() => User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value ?? "Viewer";

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 200) pageSize = 50;
        var userId = CurrentUserId();
        var role = CurrentRole();

        var query = _db.AuditLogs.AsQueryable();
        if (role != "Admin")
        {
            query = query.Where(a => a.ActorId == userId);
        }
        var total = await query.CountAsync();
        var items = await query.OrderByDescending(a => a.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new { items, total, page, pageSize });
    }
}
