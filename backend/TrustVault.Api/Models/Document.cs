using System.ComponentModel.DataAnnotations;

namespace TrustVault.Api.Models;

public class Document
{
    public Guid Id { get; set; } = Guid.NewGuid();
    [Required, MaxLength(256)]
    public string Name { get; set; } = string.Empty;
    [Required, MaxLength(256)]
    public string OriginalFileName { get; set; } = string.Empty;
    [Required, MaxLength(128)]
    public string ContentType { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public Guid OwnerId { get; set; }
    public User? Owner { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    [MaxLength(1024)]
    public string? Description { get; set; }
    [MaxLength(512)]
    public string? Tags { get; set; }
    [Required, MaxLength(512)]
    public string StoragePath { get; set; } = string.Empty;
}
