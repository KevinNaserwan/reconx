using Microsoft.AspNetCore.Mvc;

namespace ReconX.Api.Controllers;

[ApiController]
[Route("api/v1/family")]
public class FamilyController : ControllerBase
{
    // In-memory persistent state for live user session
    private static readonly List<MemberDto> Members = new()
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
    };

    private static readonly List<InternalTransferDto> Transfers = new();
    private static readonly List<JointBudgetDto> Budgets = new();

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

    public class AddMemberRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = "Anggota"; // Istri, Anak, Orang Tua
        public string? Email { get; set; }
    }

    public class AddWalletRequest
    {
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
        public string? WalletId { get; set; }
        public bool IsShared { get; set; }
    }

    [HttpGet("summary")]
    public IActionResult GetFamilySummary([FromQuery] string? mode = "family")
    {
        var kevin = Members.FirstOrDefault(m => m.Id == "mem-kevin");
        var kevinNetWorth = kevin?.TotalBalance ?? 0m;
        var totalFamilyNetWorth = Members.Sum(m => m.TotalBalance);
        var connectedDevicesCount = Members.Count(m => m.DeviceStatus == "ONLINE");

        return Ok(new
        {
            familyGroup = new
            {
                id = "fam-kevin-001",
                name = "Keluarga Kevin & Istri",
                inviteCode = "FAM-KVN-8821",
                head = "Kevin Naserwan",
                activeMode = mode,
                totalNetWorth = mode == "personal" ? kevinNetWorth : totalFamilyNetWorth,
                membersCount = Members.Count,
                connectedDevicesCount = connectedDevicesCount,
                members = Members.Select(m => new
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
                jointBudgets = Budgets,
                internalTransfers = Transfers
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

        Members.Add(newMember);

        return Ok(new
        {
            success = true,
            message = $"Anggota '{newMember.Name}' ({newMember.Role}) berhasil ditambahkan ke Keluarga.",
            member = newMember
        });
    }

    [HttpPost("wallet/add")]
    public IActionResult AddWallet([FromBody] AddWalletRequest request)
    {
        var member = Members.FirstOrDefault(m => m.Id == request.MemberId) ?? Members.First();
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

        if (request.InviteCode.Trim().ToUpperInvariant() != "FAM-KVN-8821")
        {
            return BadRequest(new { success = false, message = "Kode undangan tidak valid atau telah kadaluarsa." });
        }

        var memberName = !string.IsNullOrWhiteSpace(request.MemberName) ? request.MemberName : "Anggota Baru";
        var memberRole = !string.IsNullOrWhiteSpace(request.MemberRole) ? request.MemberRole : "Istri";

        var member = new MemberDto
        {
            Id = $"mem-{Guid.NewGuid().ToString()[..6]}",
            Name = memberName,
            Role = memberRole,
            Avatar = $"https://api.dicebear.com/7.x/avataaars/svg?seed={Uri.EscapeDataString(memberName)}",
            Device = request.DeviceId ?? "Android Phone - Companion Active",
            DeviceStatus = "ONLINE",
            IsCurrentProfile = false,
            Wallets = new List<WalletDto>()
        };

        Members.Add(member);

        return Ok(new
        {
            success = true,
            message = $"Perangkat berhasil terhubung ke Family Group 'Keluarga Kevin & Istri' sebagai {member.Role}.",
            member
        });
    }

    [HttpPost("wallet/toggle-share")]
    public IActionResult ToggleWalletShare([FromBody] ToggleWalletShareRequest request)
    {
        foreach (var member in Members)
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
}
