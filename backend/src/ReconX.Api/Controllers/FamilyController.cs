using Microsoft.AspNetCore.Mvc;

namespace ReconX.Api.Controllers;

[ApiController]
[Route("api/v1/family")]
public class FamilyController : ControllerBase
{
    public class JoinFamilyRequest
    {
        public string? InviteCode { get; set; }
        public string? MemberName { get; set; }
        public string? MemberRole { get; set; } // "Suami", "Istri", "Anak", "Orang Tua"
        public string? DeviceId { get; set; }
        public string? Email { get; set; }
    }

    public class ToggleWalletShareRequest
    {
        public string? WalletId { get; set; }
        public bool IsShared { get; set; }
    }

    [HttpGet("summary")]
    public IActionResult GetFamilySummary([FromQuery] string? mode = "family")
    {
        // Member 1: Kevin Naserwan (Suami / Head)
        var kevinWallets = new[]
        {
            new { id = "w-blu", name = "blu by BCA Digital", type = "BANK", accountNo = "5040182910", balance = 14_850_000m, isShared = true, syncStatus = "LIVE_SYNC", app = "blu BCA", icon = "Landmark" },
            new { id = "w-super", name = "Superbank Indonesia", type = "BANK", accountNo = "8810294821", balance = 6_200_000m, isShared = false, syncStatus = "LIVE_SYNC", app = "Superbank", icon = "Zap" },
            new { id = "w-bibit", name = "Bibit Reksadana & SBN", type = "INVEST", accountNo = "BBT-KVN-991", balance = 35_000_000m, isShared = true, syncStatus = "DAILY_AUM", app = "Bibit", icon = "TrendingUp" },
            new { id = "w-pluang", name = "Pluang US Stocks & Crypto", type = "INVEST", accountNo = "PLG-KVN-301", balance = 22_500_000m, isShared = false, syncStatus = "DAILY_AUM", app = "Pluang", icon = "Coins" },
            new { id = "w-bareksa", name = "Bareksa Emas Fisik & Sukuk", type = "INVEST", accountNo = "BRK-KVN-102", balance = 12_000_000m, isShared = true, syncStatus = "DAILY_AUM", app = "Bareksa", icon = "Gem" },
        };

        // Member 2: Istri Kevin (Pasangan / Co-Admin)
        var istriWallets = new[]
        {
            new { id = "w-seabank", name = "SeaBank Indonesia", type = "BANK", accountNo = "9012847192", balance = 18_400_000m, isShared = true, syncStatus = "LIVE_SYNC", app = "SeaBank", icon = "Landmark" },
            new { id = "w-shopeepay", name = "ShopeePay Balance", type = "EWALLET", accountNo = "081298412891", balance = 1_850_000m, isShared = true, syncStatus = "LIVE_SYNC", app = "ShopeePay", icon = "ShoppingBag" },
            new { id = "w-tokopedia", name = "Tokopedia / GoPay", type = "EWALLET", accountNo = "081298412891", balance = 820_000m, isShared = true, syncStatus = "LIVE_SYNC", app = "Tokopedia", icon = "ShoppingBag" },
            new { id = "w-ovo", name = "OVO Cash", type = "EWALLET", accountNo = "081298412891", balance = 450_000m, isShared = false, syncStatus = "LIVE_SYNC", app = "OVO", icon = "Wallet" },
        };

        // Member 3: Anak (Tabungan Pendidikan & Uang Saku)
        var anakWallets = new[]
        {
            new { id = "w-junior", name = "Rekening Junior Tabungan", type = "BANK", accountNo = "Junior-0182", balance = 5_000_000m, isShared = true, syncStatus = "MANAGED", app = "bluJunior", icon = "PiggyBank" },
        };

        var kevinNetWorth = kevinWallets.Sum(w => w.balance);
        var istriNetWorth = istriWallets.Sum(w => w.balance);
        var anakNetWorth = anakWallets.Sum(w => w.balance);
        var totalFamilyNetWorth = kevinNetWorth + istriNetWorth + anakNetWorth;

        // Family Internal Transfers (e.g. Suami -> Istri for belanja bulanan)
        var internalTransfers = new[]
        {
            new
            {
                id = "fit-101",
                fromMember = "Kevin Naserwan (Suami)",
                toMember = "Istri Kevin",
                sourceWallet = "blu BCA",
                destinationWallet = "SeaBank Indonesia",
                amount = 7_500_000m,
                category = "Uang Belanja Bulanan Keluarga",
                timestamp = DateTime.UtcNow.AddDays(-2).ToString("yyyy-MM-dd HH:mm:ss"),
                status = "RECONCILED_NON_EXPENSE",
                notes = "Otomatis dieliminasi dari pengeluaran eksternal (Internal Transfer)"
            },
            new
            {
                id = "fit-102",
                fromMember = "Kevin Naserwan (Suami)",
                toMember = "Tabungan Anak",
                sourceWallet = "Superbank Indonesia",
                destinationWallet = "Rekening Junior Tabungan",
                amount = 1_000_000m,
                category = "Alokasi Uang Saku & Tabungan Leo",
                timestamp = DateTime.UtcNow.AddDays(-5).ToString("yyyy-MM-dd HH:mm:ss"),
                status = "RECONCILED_NON_EXPENSE",
                notes = "Transfer internal dompet keluarga aman tanpa duplikasi"
            }
        };

        // Joint Budgets
        var jointBudgets = new[]
        {
            new { name = "Belanja Bulanan & Dapur", allocated = 8_000_000m, spent = 4_250_000m, remaining = 3_750_000m, pic = "Istri Kevin" },
            new { name = "Investasi Rutin Rumah Tangga", allocated = 15_000_000m, spent = 15_000_000m, remaining = 0m, pic = "Kevin Naserwan" },
            new { name = "Kebutuhan & Kursus Anak", allocated = 3_000_000m, spent = 1_200_000m, remaining = 1_800_000m, pic = "Bersama" }
        };

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
                membersCount = 3,
                connectedDevicesCount = 2,
                members = new object[]
                {
                    new
                    {
                        id = "mem-kevin",
                        name = "Kevin Naserwan",
                        role = "Suami (Head of Family)",
                        avatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin",
                        device = "Xiaomi 13 (Android 14) - Active",
                        deviceStatus = "ONLINE",
                        wallets = kevinWallets,
                        totalBalance = kevinNetWorth,
                        isCurrentProfile = true
                    },
                    new
                    {
                        id = "mem-istri",
                        name = "Istri Kevin",
                        role = "Istri (Co-Admin)",
                        avatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
                        device = "Samsung Galaxy S23 (Android 14) - Active",
                        deviceStatus = "ONLINE",
                        wallets = istriWallets,
                        totalBalance = istriNetWorth,
                        isCurrentProfile = false
                    },
                    new
                    {
                        id = "mem-anak",
                        name = "Leo (Anak)",
                        role = "Anak (Pendidikan & Saku)",
                        avatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=Leo",
                        device = "Managed Account",
                        deviceStatus = "MANAGED",
                        wallets = anakWallets,
                        totalBalance = anakNetWorth,
                        isCurrentProfile = false
                    }
                },
                jointBudgets,
                internalTransfers
            }
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

        return Ok(new
        {
            success = true,
            message = $"Berhasil bergabung ke grup 'Keluarga Kevin & Istri' sebagai {request.MemberRole ?? "Anggota"}.",
            familyGroup = new
            {
                id = "fam-kevin-001",
                name = "Keluarga Kevin & Istri",
                role = request.MemberRole ?? "Anggota",
                syncStatus = "LINKED"
            }
        });
    }

    [HttpPost("wallet/toggle-share")]
    public IActionResult ToggleWalletShare([FromBody] ToggleWalletShareRequest request)
    {
        return Ok(new
        {
            success = true,
            walletId = request.WalletId,
            isShared = request.IsShared,
            message = request.IsShared 
                ? "Dompet berhasil dibagikan ke ringkasan Mode Family." 
                : "Dompet kini bersifat privat (Hanya terlihat di Mode Personal)."
        });
    }
}
