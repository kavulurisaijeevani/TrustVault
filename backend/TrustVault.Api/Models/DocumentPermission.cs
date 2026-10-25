using System.ComponentModel.DataAnnotations;

namespace TrustVault.Api.Models;

public class DocumentPermission
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DocumentId { get; set; }
    public Document? Document { get; set; }
    public Guid UserId { get; set; }
    public User? User { get; set; }
    [Required, MaxLength(16)]
    public string Level { get; set; } = "Read";
    public DateTime GrantedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public bool IsActive { get; set; } = true;
}
