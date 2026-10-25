using System.ComponentModel.DataAnnotations;

namespace TrustVault.Api.Models;

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public Guid? ActorId { get; set; }
    [MaxLength(256)]
    public string? ActorEmail { get; set; }
    [Required, MaxLength(128)]
    public string Action { get; set; } = string.Empty;
    public Guid? TargetDocumentId { get; set; }
    [MaxLength(256)]
    public string? TargetDocumentName { get; set; }
    [Required, MaxLength(32)]
    public string Outcome { get; set; } = "Success";
    [MaxLength(64)]
    public string? IpAddress { get; set; }
    [MaxLength(128)]
    public string? CorrelationId { get; set; }
    [MaxLength(2048)]
    public string? Details { get; set; }
}
