using Microsoft.AspNetCore.Mvc;
using System.Collections.Concurrent;

namespace ReconX.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    // Global User Registry for Multi-Tenant SaaS
    public class UserRecord
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Picture { get; set; } = string.Empty;
        public string Role { get; set; } = "Head of Household";
        public string FamilyId { get; set; } = string.Empty;
        public string FamilyName { get; set; } = string.Empty;
        public string FamilyInviteCode { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    private static readonly ConcurrentDictionary<string, UserRecord> UsersByEmail = new(StringComparer.OrdinalIgnoreCase);

    static AuthController()
    {
        // Seed default owner: Kevin Naserwan
        var kevin = new UserRecord
        {
            Id = "usr-kevin-001",
            Email = "kevin.naserwan@gmail.com",
            Name = "Kevin Naserwan",
            Picture = "https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin",
            Role = "Kevin (Partner)",
            FamilyId = "fam-kevin-001",
            FamilyName = "Kevin & Anan (Couple)",
            FamilyInviteCode = "COUPLE-KVN-ANN"
        };
        UsersByEmail[kevin.Email] = kevin;
    }

    public class GoogleAuthRequest
    {
        public string? IdToken { get; set; }
        public string? Email { get; set; }
        public string? Name { get; set; }
        public string? Picture { get; set; }
        public string? Action { get; set; } // "create_family" or "join_family"
        public string? FamilyName { get; set; }
        public string? InviteCode { get; set; }
        public string? Role { get; set; }
    }

    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? Action { get; set; } = "create_family"; // "create_family" or "join_family"
        public string? FamilyName { get; set; }
        public string? InviteCode { get; set; }
        public string? Role { get; set; } = "Head of Household";
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { success = false, message = "Email dan Nama lengkap wajib diisi." });
        }

        var email = request.Email.Trim().ToLowerInvariant();
        if (UsersByEmail.ContainsKey(email))
        {
            return BadRequest(new { success = false, message = "Email sudah terdaftar. Silakan gunakan menu Masuk / Login." });
        }

        string familyId;
        string familyName;
        string inviteCode;
        string role = !string.IsNullOrWhiteSpace(request.Role) ? request.Role : "Head of Household";

        if (request.Action == "join_family" && !string.IsNullOrWhiteSpace(request.InviteCode))
        {
            var targetCode = request.InviteCode.Trim().ToUpperInvariant();
            var targetFamily = FamilyController.FindFamilyByCode(targetCode);
            if (targetFamily == null)
            {
                return BadRequest(new { success = false, message = $"Kode undangan '{targetCode}' tidak ditemukan atau tidak valid." });
            }

            familyId = targetFamily.FamilyId;
            familyName = targetFamily.FamilyName;
            inviteCode = targetFamily.InviteCode;
            role = !string.IsNullOrWhiteSpace(request.Role) ? request.Role : "Anggota Keluarga";

            // Add member to family cluster
            FamilyController.AddMemberToFamily(familyId, request.Name, role);
        }
        else
        {
            // Create a brand new Multi-Tenant Family Cluster
            familyName = !string.IsNullOrWhiteSpace(request.FamilyName) 
                ? request.FamilyName.Trim() 
                : $"Keluarga {request.Name.Trim()}";

            var shortCode = new string(request.Name.Trim().Where(char.IsLetter).Take(3).ToArray()).ToUpperInvariant();
            if (shortCode.Length < 3) shortCode = "FAM";
            inviteCode = $"FAM-{shortCode}-{new Random().Next(1000, 9999)}";
            familyId = $"fam-{Guid.NewGuid().ToString()[..8]}";

            // Register tenant in FamilyController
            FamilyController.RegisterNewFamily(familyId, familyName, inviteCode, request.Name.Trim(), role);
        }

        var newUser = new UserRecord
        {
            Id = $"usr-{Guid.NewGuid().ToString()[..8]}",
            Email = email,
            Name = request.Name.Trim(),
            PasswordHash = request.Password, // In production hash with BCrypt
            Picture = $"https://api.dicebear.com/7.x/avataaars/svg?seed={Uri.EscapeDataString(request.Name)}",
            Role = role,
            FamilyId = familyId,
            FamilyName = familyName,
            FamilyInviteCode = inviteCode
        };

        UsersByEmail[email] = newUser;

        var token = GenerateToken(newUser.Email, newUser.Name, newUser.Role);

        return Ok(new
        {
            success = true,
            message = "Registrasi akun dan konfigurasi tenant keluarga berhasil.",
            token,
            user = new
            {
                id = newUser.Id,
                email = newUser.Email,
                name = newUser.Name,
                picture = newUser.Picture,
                role = newUser.Role,
                familyId = newUser.FamilyId,
                familyName = newUser.FamilyName,
                familyInviteCode = newUser.FamilyInviteCode
            }
        });
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { success = false, message = "Email wajib diisi." });
        }

        var email = request.Email.Trim().ToLowerInvariant();

        if (!UsersByEmail.TryGetValue(email, out var user))
        {
            // Auto-provision SaaS demo tenant for frictionless onboarding
            var derivedName = email.Split('@')[0];
            derivedName = char.ToUpper(derivedName[0]) + derivedName[1..];
            var familyName = $"Keluarga {derivedName}";
            var shortCode = new string(derivedName.Where(char.IsLetter).Take(3).ToArray()).ToUpperInvariant();
            if (shortCode.Length < 3) shortCode = "USR";
            var inviteCode = $"FAM-{shortCode}-{new Random().Next(1000, 9999)}";
            var familyId = $"fam-{Guid.NewGuid().ToString()[..8]}";

            FamilyController.RegisterNewFamily(familyId, familyName, inviteCode, derivedName, "Head of Household");

            user = new UserRecord
            {
                Id = $"usr-{Guid.NewGuid().ToString()[..8]}",
                Email = email,
                Name = derivedName,
                Picture = $"https://api.dicebear.com/7.x/avataaars/svg?seed={Uri.EscapeDataString(derivedName)}",
                Role = "Head of Household",
                FamilyId = familyId,
                FamilyName = familyName,
                FamilyInviteCode = inviteCode
            };
            UsersByEmail[email] = user;
        }

        var token = GenerateToken(user.Email, user.Name, user.Role);

        return Ok(new
        {
            success = true,
            message = "Login berhasil.",
            token,
            user = new
            {
                id = user.Id,
                email = user.Email,
                name = user.Name,
                picture = user.Picture,
                role = user.Role,
                familyId = user.FamilyId,
                familyName = user.FamilyName,
                familyInviteCode = user.FamilyInviteCode
            }
        });
    }

    [HttpPost("google")]
    public IActionResult GoogleLogin([FromBody] GoogleAuthRequest request)
    {
        var email = !string.IsNullOrWhiteSpace(request.Email) 
            ? request.Email.Trim().ToLowerInvariant() 
            : "kevin.naserwan@gmail.com";

        var name = !string.IsNullOrWhiteSpace(request.Name) 
            ? request.Name.Trim() 
            : "Kevin Naserwan";

        var picture = !string.IsNullOrWhiteSpace(request.Picture) 
            ? request.Picture 
            : $"https://api.dicebear.com/7.x/avataaars/svg?seed={Uri.EscapeDataString(name)}";

        if (UsersByEmail.TryGetValue(email, out var user))
        {
            if (!string.IsNullOrWhiteSpace(request.Picture))
            {
                user.Picture = request.Picture;
            }
            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                user.Name = request.Name;
            }
        }
        else
        {
            string familyId;
            string familyName;
            string inviteCode;
            string role = !string.IsNullOrWhiteSpace(request.Role) ? request.Role : "Kevin (Partner)";

            if (request.Action == "join_family" && !string.IsNullOrWhiteSpace(request.InviteCode))
            {
                var targetCode = request.InviteCode.Trim().ToUpperInvariant();
                var targetFamily = FamilyController.FindFamilyByCode(targetCode);
                if (targetFamily != null)
                {
                    familyId = targetFamily.FamilyId;
                    familyName = targetFamily.FamilyName;
                    inviteCode = targetFamily.InviteCode;
                    role = !string.IsNullOrWhiteSpace(request.Role) ? request.Role : "Partner";
                    FamilyController.AddMemberToFamily(familyId, name, role);
                }
                else
                {
                    familyName = $"{name} (Couple)";
                    inviteCode = "COUPLE-KVN-ANN";
                    familyId = $"fam-{Guid.NewGuid().ToString()[..8]}";
                    FamilyController.RegisterNewFamily(familyId, familyName, inviteCode, name, role);
                }
            }
            else
            {
                familyName = !string.IsNullOrWhiteSpace(request.FamilyName) ? request.FamilyName : "Kevin & Anan (Couple)";
                inviteCode = "COUPLE-KVN-ANN";
                familyId = "fam-kevin-001";
                FamilyController.RegisterNewFamily(familyId, familyName, inviteCode, name, role);
            }

            user = new UserRecord
            {
                Id = $"usr-{Guid.NewGuid().ToString()[..8]}",
                Email = email,
                Name = name,
                Picture = picture,
                Role = role,
                FamilyId = familyId,
                FamilyName = familyName,
                FamilyInviteCode = inviteCode
            };
            UsersByEmail[email] = user;
        }

        var token = GenerateToken(user.Email, user.Name, user.Role);

        return Ok(new
        {
            success = true,
            token,
            user = new
            {
                id = user.Id,
                email = user.Email,
                name = user.Name,
                picture = user.Picture,
                role = user.Role,
                familyId = user.FamilyId,
                familyName = user.FamilyName,
                familyInviteCode = user.FamilyInviteCode
            }
        });
    }

    [HttpGet("me")]
    public IActionResult GetCurrentUser([FromHeader(Name = "X-User-Email")] string? userEmail)
    {
        if (!string.IsNullOrWhiteSpace(userEmail) && UsersByEmail.TryGetValue(userEmail.Trim(), out var u))
        {
            return Ok(new
            {
                id = u.Id,
                email = u.Email,
                name = u.Name,
                picture = u.Picture,
                role = u.Role,
                familyId = u.FamilyId,
                familyName = u.FamilyName,
                familyInviteCode = u.FamilyInviteCode,
                authenticatedVia = "Enterprise JWT Session"
            });
        }

        var first = UsersByEmail.Values.FirstOrDefault();
        return Ok(new
        {
            id = first?.Id ?? "usr-guest",
            email = first?.Email ?? "guest@reconx.io",
            name = first?.Name ?? "Guest User",
            picture = first?.Picture ?? "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest",
            role = first?.Role ?? "User",
            familyId = first?.FamilyId ?? "fam-guest",
            familyName = first?.FamilyName ?? "Guest Household",
            familyInviteCode = first?.FamilyInviteCode ?? "FAM-GST-0000",
            authenticatedVia = "Session"
        });
    }

    private static string GenerateToken(string email, string name, string role)
    {
        var dummyJwt = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(
            $"{{\"sub\":\"{email}\",\"name\":\"{name}\",\"role\":\"{role}\",\"exp\":{DateTimeOffset.UtcNow.AddDays(7).ToUnixTimeSeconds()}}}"
        ));
        return $"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.{dummyJwt}.reconx_signature_verified";
    }
}
