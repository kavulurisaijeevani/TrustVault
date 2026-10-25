namespace TrustVault.Api.DTOs;

public record CreatePermissionRequest(Guid DocumentId, Guid UserId, string Level, DateTime? ExpiresAt);
public record UpdateExpiryRequest(DateTime? ExpiresAt);
