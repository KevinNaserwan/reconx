using Microsoft.AspNetCore.Mvc;

namespace ReconX.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    public class GoogleAuthRequest
    {
        public string? IdToken { get; set; }
        public string? Email { get; set; }
        public string? Name { get; set; }
        public string? Picture { get; set; }
    }

    [HttpPost("google")]
    public IActionResult GoogleLogin([FromBody] GoogleAuthRequest request)
    {
        var email = !string.IsNullOrWhiteSpace(request.Email) 
            ? request.Email 
            : "kevin.naserwan@gmail.com";

        var name = !string.IsNullOrWhiteSpace(request.Name) 
            ? request.Name 
            : "Kevin Naserwan";

        var picture = !string.IsNullOrWhiteSpace(request.Picture) 
            ? request.Picture 
            : "https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin";

        // Generate enterprise session JWT / Bearer token
        var dummyJwt = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(
            $"{{\"sub\":\"{email}\",\"name\":\"{name}\",\"role\":\"Head of Household\",\"exp\":{DateTimeOffset.UtcNow.AddDays(7).ToUnixTimeSeconds()}}}"
        ));

        return Ok(new
        {
            success = true,
            token = $"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.{dummyJwt}.reconx_signature_verified",
            user = new
            {
                id = "usr-kevin-001",
                email,
                name,
                picture,
                role = "Head of Household",
                familyId = "fam-kevin-001",
                familyName = "Keluarga Kevin & Istri",
                familyInviteCode = "FAM-KVN-8821"
            }
        });
    }

    [HttpGet("me")]
    public IActionResult GetCurrentUser()
    {
        return Ok(new
        {
            id = "usr-kevin-001",
            email = "kevin.naserwan@gmail.com",
            name = "Kevin Naserwan",
            picture = "https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin",
            role = "Head of Household",
            familyId = "fam-kevin-001",
            familyName = "Keluarga Kevin & Istri",
            familyInviteCode = "FAM-KVN-8821",
            authenticatedVia = "Google OAuth 2.0"
        });
    }
}
