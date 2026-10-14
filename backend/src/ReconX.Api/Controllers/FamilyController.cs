using Microsoft.AspNetCore.Mvc;
using System.Collections.Concurrent;

namespace ReconX.Api.Controllers;

[ApiController]
[Route("api/v1/family")]
public class FamilyController : ControllerBase
{
    public class WalletDto
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = "BANK"; // BANK, EWALLET, INVEST
        public string AccountNo { get; set; } = string.Empty;
        public decimal Balance { get; set; } = 0m;
        public bool IsShared { get; set; } = true;
        public string SyncStatus { get; set; } = "MANUAL";
        public string App { get; set; } = string.Empty;
        public string Icon { get; set; } = "Wallet";
    }

    public class MemberDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Avatar { get; set; } = string.Empty;
        public string Device { get; set; } = string.Empty;
        public string DeviceStatus { get; set; } = string.Empty;
        public bool IsCurrentProfile { get; set; } = false;
        public List<WalletDto> Wallets { get; set; } = new();
        public decimal TotalBalance => Wallets.Sum(w => w.Balance);
    }

    public class InternalTransferDto
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string FromMember { get; set; } = string.Empty;
        public string ToMember { get; set; } = string.Empty;
        public string SourceWallet { get; set; } = string.Empty;
        public string DestinationWallet { get; set; } = string.Empty;
        public decimal Amount { get; set; } = 0m;
        public string Category { get; set; } = string.Empty;
        public string Timestamp { get; set; } = string.Empty;
        public string Status { get; set; } = "RECONCILED_NON_EXPENSE";
        public string Notes { get; set; } = string.Empty;
    }

    public class JointBudgetDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal Allocated { get; set; } = 0m;
        public decimal Spent { get; set; } = 0m;
        public decimal Remaining => Math.Max(0, Allocated - Spent);
        public string Pic { get; set; } = string.Empty;
    }

    public class FamilyGroupState
    {
        public string FamilyId { get; set; } = string.Empty;
        public string FamilyName { get; set; } = string.Empty;
        public string InviteCode { get; set; } = string.Empty;
        public string Head { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<MemberDto> Members { get; set; } = new();
        public List<InternalTransferDto> Transfers { get; set; } = new();
        public List<JointBudgetDto> Budgets { get; set; } = new();
    }

    // Multi-Tenant In-Memory Family Store (Keyed by FamilyId)
    private static readonly ConcurrentDictionary<string, FamilyGroupState> FamilyStore = new();

    static FamilyController()
    {
        // Seed initial family cluster: Keluarga Kevin & Istri (Zero State)
        var kevinFamily = new FamilyGroupState
        {
            FamilyId = "fam-kevin-001",
            FamilyName = "Keluarga Kevin & Istri",
            InviteCode = "FAM-KVN-8821",
            Head = "Kevin Naserwan",
            Members = new List<MemberDto>
            {
                new MemberDto
                {
                    Id = "mem-kevin",
                    Name = "Kevin Naserwan",
                    Role = "Suami (Head of Family)",
                    Avatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin",
                    Device = "Belum Terhubung (Menunggu Companion APK)",
                    DeviceStatus = "OFFLINE",
                    IsCurrentProfile = true,
                    Wallets = new List<WalletDto>()
                }
            }
        };

        FamilyStore[kevinFamily.FamilyId] = kevinFamily;
    }

    public static FamilyGroupState? FindFamilyByCode(string inviteCode)
    {
        return FamilyStore.Values.FirstOrDefault(f => f.InviteCode.Equals(inviteCode.Trim(), StringComparison.OrdinalIgnoreCase));
    }

    public static void RegisterNewFamily(string familyId, string familyName, string inviteCode, string headName, string headRole)
    {
        var family = new FamilyGroupState
        {
            FamilyId = familyId,
            FamilyName = familyName,
            InviteCode = inviteCode,
            Head = headName,
            Members = new List<MemberDto>
            {
                new MemberDto
                {
                    Id = $"mem-{Guid.NewGuid().ToString()[..6]}",
                    Name = headName,
                    Role = headRole,
                    Avatar = $"https://api.dicebear.com/7.x/avataaars/svg?seed={Uri.EscapeDataString(headName)}",
                    Device = "Belum Terhubung (Menunggu Companion APK)",
                    DeviceStatus = "OFFLINE",
                    IsCurrentProfile = true,
                    Wallets = new List<WalletDto>()
                }
            }
        };

        FamilyStore[familyId] = family;
    }

    public static void AddMemberToFamily(string familyId, string memberName, string role)
    {
        if (FamilyStore.TryGetValue(familyId, out var family))
        {
            family.Members.Add(new MemberDto
            {
                Id = $"mem-{Guid.NewGuid().ToString()[..6]}",
                Name = memberName,
                Role = role,
                Avatar = $"https://api.dicebear.com/7.x/avataaars/svg?seed={Uri.EscapeDataString(memberName)}",
                Device = "Menunggu Pairing Companion APK",
                DeviceStatus = "PENDING_PAIR",
                IsCurrentProfile = false,
                Wallets = new List<WalletDto>()
            });
        }
    }

    private FamilyGroupState ResolveFamily(string? requestedFamilyId, string? inviteCode)
    {
        if (!string.IsNullOrWhiteSpace(requestedFamilyId) && FamilyStore.TryGetValue(requestedFamilyId, out var f))
        {
            return f;
        }

        if (!string.IsNullOrWhiteSpace(inviteCode))
        {
            var byCode = FindFamilyByCode(inviteCode);
            if (byCode != null) return byCode;
        }

        // Check Header "X-Family-Id"
        if (Request.Headers.TryGetValue("X-Family-Id", out var headerVal))
        {
            var fId = headerVal.ToString();
            if (FamilyStore.TryGetValue(fId, out var fFromHeader))
            {
                return fFromHeader;
            }
        }

        // Fallback to primary tenant
        return FamilyStore.Values.FirstOrDefault() ?? new FamilyGroupState
        {
            FamilyId = "fam-default",
            FamilyName = "Household Cluster",
            InviteCode = "FAM-DEFAULT",
            Head = "User",
            Members = new List<MemberDto>()
        };
    }

    public class AddMemberRequest
    {
        public string? FamilyId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = "Anggota"; // Istri, Anak, Orang Tua
        public string? Email { get; set; }
    }

    public class AddWalletRequest
    {
        public string? FamilyId { get; set; }
        public string MemberId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = "BANK";
        public string AccountNo { get; set; } = string.Empty;
        public decimal InitialBalance { get; set; } = 0m;
        public bool IsShared { get; set; } = true;
    }

    public class JoinFamilyRequest
    {
        public string? InviteCode { get; set; }
        public string? MemberName { get; set; }
        public string? MemberRole { get; set; }
        public string? DeviceId { get; set; }
    }

    public class ToggleWalletShareRequest
    {
        public string? FamilyId { get; set; }
        public string? WalletId { get; set; }
        public bool IsShared { get; set; }
    }

    public class UpdateClusterRequest
    {
        public string? FamilyId { get; set; }
        public string FamilyName { get; set; } = string.Empty;
    }

    [HttpGet("summary")]
    public IActionResult GetFamilySummary(
        [FromQuery] string? mode = "family",
        [FromQuery] string? familyId = null,
        [FromQuery] string? inviteCode = null)
    {
        var family = ResolveFamily(familyId, inviteCode);

        var currentProfile = family.Members.FirstOrDefault(m => m.IsCurrentProfile) ?? family.Members.FirstOrDefault();
        var personalNetWorth = currentProfile?.TotalBalance ?? 0m;
        var totalFamilyNetWorth = family.Members.Sum(m => m.TotalBalance);
        var connectedDevicesCount = family.Members.Count(m => m.DeviceStatus == "ONLINE");

        return Ok(new
        {
            familyGroup = new
            {
                id = family.FamilyId,
                name = family.FamilyName,
                inviteCode = family.InviteCode,
                head = family.Head,
                activeMode = mode,
                totalNetWorth = mode == "personal" ? personalNetWorth : totalFamilyNetWorth,
                membersCount = family.Members.Count,
                connectedDevicesCount = connectedDevicesCount,
                members = family.Members.Select(m => new
                {
                    id = m.Id,
                    name = m.Name,
                    role = m.Role,
                    avatar = m.Avatar,
                    device = m.Device,
                    deviceStatus = m.DeviceStatus,
                    wallets = m.Wallets,
                    totalBalance = m.TotalBalance,
                    isCurrentProfile = m.IsCurrentProfile
                }),
                jointBudgets = family.Budgets,
                internalTransfers = family.Transfers
            }
        });
    }

    [HttpPost("member/add")]
    public IActionResult AddMember([FromBody] AddMemberRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { success = false, message = "Nama anggota keluarga wajib diisi." });
        }

        var family = ResolveFamily(request.FamilyId, null);

        var newMember = new MemberDto
        {
            Id = $"mem-{Guid.NewGuid().ToString()[..6]}",
            Name = request.Name.Trim(),
            Role = request.Role,
            Avatar = $"https://api.dicebear.com/7.x/avataaars/svg?seed={Uri.EscapeDataString(request.Name)}",
            Device = "Menunggu Pairing Companion APK",
            DeviceStatus = "PENDING_PAIR",
            IsCurrentProfile = false,
            Wallets = new List<WalletDto>()
        };

        family.Members.Add(newMember);

        return Ok(new
        {
            success = true,
            message = $"Anggota '{newMember.Name}' ({newMember.Role}) berhasil ditambahkan ke {family.FamilyName}.",
            member = newMember
        });
    }

    [HttpPost("wallet/add")]
    public IActionResult AddWallet([FromBody] AddWalletRequest request)
    {
        var family = ResolveFamily(request.FamilyId, null);
        var member = family.Members.FirstOrDefault(m => m.Id == request.MemberId) ?? family.Members.FirstOrDefault();
        if (member == null)
        {
            return BadRequest(new { success = false, message = "Anggota keluarga tidak ditemukan." });
        }

        var icon = request.Type switch
        {
            "BANK" => "Landmark",
            "EWALLET" => "ShoppingBag",
            "INVEST" => "TrendingUp",
            _ => "Wallet"
        };

        var wallet = new WalletDto
        {
            Id = $"w-{Guid.NewGuid().ToString()[..6]}",
            Name = request.Name,
            Type = request.Type,
            AccountNo = request.AccountNo,
            Balance = request.InitialBalance,
            IsShared = request.IsShared,
            SyncStatus = "CONNECTED",
            App = request.Name,
            Icon = icon
        };

        member.Wallets.Add(wallet);

        return Ok(new
        {
            success = true,
            message = $"Dompet '{wallet.Name}' berhasil ditambahkan ke akun {member.Name}.",
            wallet
        });
    }

    [HttpPost("join")]
    public IActionResult JoinFamily([FromBody] JoinFamilyRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.InviteCode))
        {
            return BadRequest(new { success = false, message = "Kode undangan Family Group wajib diisi." });
        }

        var family = FindFamilyByCode(request.InviteCode.Trim());
        if (family == null)
        {
            return BadRequest(new { success = false, message = "Kode undangan tidak valid atau tidak ditemukan." });
        }

        var memberName = !string.IsNullOrWhiteSpace(request.MemberName) ? request.MemberName : "Anggota Baru";
        var memberRole = !string.IsNullOrWhiteSpace(request.MemberRole) ? request.MemberRole : "Istri / Pasangan";

        var member = new MemberDto
        {
            Id = $"mem-{Guid.NewGuid().ToString()[..6]}",
            Name = memberName,
            Role = memberRole,
            Avatar = $"https://api.dicebear.com/7.x/avataaars/svg?seed={Uri.EscapeDataString(memberName)}",
            Device = request.DeviceId ?? "Android Companion Active",
            DeviceStatus = "ONLINE",
            IsCurrentProfile = false,
            Wallets = new List<WalletDto>()
        };

        family.Members.Add(member);

        return Ok(new
        {
            success = true,
            message = $"Perangkat berhasil terhubung ke Family Group '{family.FamilyName}' sebagai {member.Role}.",
            familyId = family.FamilyId,
            familyName = family.FamilyName,
            member
        });
    }

    [HttpPost("wallet/toggle-share")]
    public IActionResult ToggleWalletShare([FromBody] ToggleWalletShareRequest request)
    {
        var family = ResolveFamily(request.FamilyId, null);
        foreach (var member in family.Members)
        {
            var w = member.Wallets.FirstOrDefault(x => x.Id == request.WalletId);
            if (w != null)
            {
                w.IsShared = request.IsShared;
                break;
            }
        }

        return Ok(new
        {
            success = true,
            walletId = request.WalletId,
            isShared = request.IsShared,
            message = request.IsShared 
                ? "Dompet dibagikan ke ringkasan Mode Family." 
                : "Dompet kini privat (Hanya terlihat di Mode Personal)."
        });
    }

    [HttpPost("cluster/update")]
    public IActionResult UpdateCluster([FromBody] UpdateClusterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FamilyName))
        {
            return BadRequest(new { success = false, message = "Nama Cluster Keluarga wajib diisi." });
        }

        var family = ResolveFamily(request.FamilyId, null);
        family.FamilyName = request.FamilyName.Trim();

        return Ok(new
        {
            success = true,
            message = $"Nama Cluster berhasil diperbarui menjadi '{family.FamilyName}'.",
            familyId = family.FamilyId,
            familyName = family.FamilyName
        });
    }
}
