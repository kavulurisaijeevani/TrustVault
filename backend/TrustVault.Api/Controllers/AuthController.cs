using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using TrustVault.Api.Data;
using TrustVault.Api.DTOs;
using TrustVault.Api.Models;
using TrustVault.Api.Services;

namespace TrustVault.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly TrustVaultDbContext _db;
    private readonly TokenService _tokens;
    public AuthController(TrustVaultDbContext db, TokenService tokens)
    {
        _db = db;
        _tokens = tokens;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new { message = "Email and password are required." });

        var email = req.Email.Trim().ToLowerInvariant();
        if (await _db.Users.AnyAsync(u => u.Email == email))
            return Conflict(new { message = "Email already registered." });

        var user = new User
        {
            Email = email,
            DisplayName = string.IsNullOrWhiteSpace(req.DisplayName) ? email : req.DisplayName.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Role = "Owner"
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var (token, expires) = _tokens.CreateToken(user);
        return Ok(new AuthResponse(token, "Bearer", expires, new UserDto(user.Id, user.Email, user.DisplayName, user.Role, user.CreatedAt)));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest req)
    {
        var email = (req.Email ?? string.Empty).Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password ?? string.Empty, user.PasswordHash))
            return Unauthorized(new { message = "Invalid credentials." });

        var (token, expires) = _tokens.CreateToken(user);
        return Ok(new AuthResponse(token, "Bearer", expires, new UserDto(user.Id, user.Email, user.DisplayName, user.Role, user.CreatedAt)));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> Me()
    {
        var idClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value;
        if (!Guid.TryParse(idClaim, out var userId)) return Unauthorized();
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return Unauthorized();
        return Ok(new UserDto(user.Id, user.Email, user.DisplayName, user.Role, user.CreatedAt));
    }
}
