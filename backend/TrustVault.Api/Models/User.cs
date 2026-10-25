using System.ComponentModel.DataAnnotations;

namespace TrustVault.Api.Models;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    [Required, EmailAddress, MaxLength(256)]
    public string Email { get; set; } = string.Empty;
    [Required, MaxLength(128)]
    public string DisplayName { get; set; } = string.Empty;
    [Required]
    public string PasswordHash { get; set; } = string.Empty;
    [Required, MaxLength(32)]
    public string Role { get; set; } = "Viewer";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
