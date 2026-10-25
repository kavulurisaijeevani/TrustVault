using Microsoft.EntityFrameworkCore;
using TrustVault.Api.Data;
using TrustVault.Api.Models;

namespace TrustVault.Api.Services;

public class PermissionService
{
    private readonly TrustVaultDbContext _db;
    public PermissionService(TrustVaultDbContext db) => _db = db;

    public async Task<bool> CanReadAsync(Guid userId, string role, Guid documentId)
    {
        if (role == "Admin") return true;
        var doc = await _db.Documents.FindAsync(documentId);
        if (doc == null) return false;
        if (doc.OwnerId == userId) return true;
        var now = DateTime.UtcNow;
        return await _db.DocumentPermissions.AnyAsync(p =>
            p.DocumentId == documentId && p.UserId == userId && p.IsActive &&
            (p.Level == "Read" || p.Level == "Edit") &&
            (p.ExpiresAt == null || p.ExpiresAt > now) &&
            p.RevokedAt == null);
    }

    public async Task<bool> CanEditAsync(Guid userId, string role, Guid documentId)
    {
        if (role == "Admin") return true;
        var doc = await _db.Documents.FindAsync(documentId);
        if (doc == null) return false;
        if (doc.OwnerId == userId) return true;
        var now = DateTime.UtcNow;
        return await _db.DocumentPermissions.AnyAsync(p =>
            p.DocumentId == documentId && p.UserId == userId && p.IsActive &&
            p.Level == "Edit" &&
            (p.ExpiresAt == null || p.ExpiresAt > now) &&
            p.RevokedAt == null);
    }

    public async Task<bool> IsOwnerOrAdminAsync(Guid userId, string role, Guid documentId)
    {
        if (role == "Admin") return true;
        var doc = await _db.Documents.FindAsync(documentId);
        return doc != null && doc.OwnerId == userId;
    }
}
