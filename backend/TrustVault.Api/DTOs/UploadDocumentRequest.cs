using Microsoft.AspNetCore.Http;

namespace TrustVault.Api.DTOs;

public class UploadDocumentRequest
{
    public IFormFile? File { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Tags { get; set; }
}
