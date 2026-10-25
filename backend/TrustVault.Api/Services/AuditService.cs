using Microsoft.EntityFrameworkCore;
using TrustVault.Api.Data;
using TrustVault.Api.Models;

namespace TrustVault.Api.Services;

public class AuditService
{
    private readonly TrustVaultDbContext _db;
    private readonly IHttpContextAccessor _http;
    public AuditService(TrustVaultDbContext db, IHttpContextAccessor http)
    {
        _db = db;
        _http = http;
    }

    public async Task LogAsync(Guid? actorId, string? actorEmail, string action, Guid? targetDocumentId, string? targetDocumentName, string outcome, string? details = null)
    {
        var ctx = _http.HttpContext;
        var ip = ctx?.Connection.RemoteIpAddress?.ToString();
        var corr = ctx?.TraceIdentifier;
        _db.AuditLogs.Add(new AuditLog
        {
            ActorId = actorId,
            ActorEmail = actorEmail,
            Action = action,
            TargetDocumentId = targetDocumentId,
            TargetDocumentName = targetDocumentName,
            Outcome = outcome,
            IpAddress = ip,
            CorrelationId = corr,
            Details = details
        });
        await _db.SaveChangesAsync();
    }
}
