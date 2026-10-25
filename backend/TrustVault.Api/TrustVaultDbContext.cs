
using Microsoft.EntityFrameworkCore;
using TrustVault.Api.Models;

namespace TrustVault.Api.Data;

public class TrustVaultDbContext : DbContext
{
    public TrustVaultDbContext(DbContextOptions<TrustVaultDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<DocumentPermission> DocumentPermissions => Set<DocumentPermission>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
        });

        modelBuilder.Entity<Document>(e =>
        {
            e.HasOne(d => d.Owner)
             .WithMany()
             .HasForeignKey(d => d.OwnerId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<DocumentPermission>(e =>
        {
            e.HasOne(p => p.Document)
             .WithMany()
             .HasForeignKey(p => p.DocumentId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(p => p.User)
             .WithMany()
             .HasForeignKey(p => p.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
