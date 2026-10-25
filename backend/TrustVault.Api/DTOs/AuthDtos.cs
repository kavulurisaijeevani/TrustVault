namespace TrustVault.Api.DTOs;

public record RegisterRequest(string Email, string Password, string DisplayName);
public record LoginRequest(string Email, string Password);

public record UserDto(Guid Id, string Email, string DisplayName, string Role, DateTime CreatedAt);

public record AuthResponse(string AccessToken, string TokenType, DateTime ExpiresAt, UserDto User);
