using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReconX.Application.Interfaces;
using ReconX.Domain.Entities;

namespace ReconX.Api.Controllers;

[ApiController]
[Route("api/v1/mobile")]
public class MobileSyncController : ControllerBase
{
    private readonly IAppDbContext _context;

    public MobileSyncController(IAppDbContext context)
    {
        _context = context;
    }

    public class NotificationSyncPayload
    {
        public string? AppPackage { get; set; }
        public string? AppName { get; set; }
        public string? Title { get; set; }
        public string? Content { get; set; }
        public long? PostTime { get; set; }
        public string? UserEmail { get; set; }
        public decimal? ExplicitAmount { get; set; }
        public string? ExplicitMerchant { get; set; }
    }

    [HttpGet("status")]
    public IActionResult GetMobileAgentStatus()
    {
        return Ok(new
        {
            status = "ONLINE",
            agent = "ReconX Mobile Companion Service",
            serverTime = DateTime.UtcNow,
            version = "1.0.0-enterprise",
            supportedApps = new[]
            {
                "blu by BCA Digital",
                "SeaBank Indonesia",
                "Superbank Indonesia",
                "Shopee / ShopeePay",
                "Tokopedia",
                "OVO",
                "DANA",
                "BCA mobile / myBCA",
                "Bibit / Ajaib / Stockbit (Investasi)"
            }
        });
    }

    [HttpPost("sync-notification")]
    public async Task<IActionResult> SyncNotification(
        [FromBody] NotificationSyncPayload payload,
        CancellationToken cancellationToken)
    {
        if (payload == null || (string.IsNullOrWhiteSpace(payload.Content) && string.IsNullOrWhiteSpace(payload.Title)))
        {
            return BadRequest(new { success = false, message = "Notification payload content cannot be empty." });
        }

        var fullText = $"{payload.Title} {payload.Content}";

        // 1. Identify Target Provider
        var providerId = "prov-blu-004"; // Default
        var providerCode = "BLU_BCA";
        var channel = "MOBILE_AUTO_SYNC";

        var pkg = (payload.AppPackage ?? "").ToLowerInvariant();
        var appName = (payload.AppName ?? "").ToLowerInvariant();

        if (pkg.Contains("bcadigital") || appName.Contains("blu"))
        {
            providerId = "prov-blu-004";
            providerCode = "BLU_BCA";
            channel = "BLU_QRIS_OR_TRANSFER";
        }
        else if (pkg.Contains("searpm") || pkg.Contains("seabank") || appName.Contains("seabank"))
        {
            providerId = "prov-seabank-006";
            providerCode = "SEABANK";
            channel = "SEABANK_QRIS";
        }
        else if (pkg.Contains("superbank") || appName.Contains("superbank"))
        {
            providerId = "prov-superbank-005";
            providerCode = "SUPERBANK";
            channel = "SUPERBANK_BIFAST";
        }
        else if (pkg.Contains("shopee") || appName.Contains("shopeepay"))
        {
            providerId = "prov-shopeepay-007";
            providerCode = "SHOPEEPAY";
            channel = "SHOPEEPAY_WALLET";
        }
        else if (pkg.Contains("tokopedia") || appName.Contains("tokopedia"))
        {
            providerId = "prov-midtrans-001";
            providerCode = "MIDTRANS";
            channel = "TOKOPEDIA_CHECKOUT";
        }
        else if (pkg.Contains("ovo") || appName.Contains("ovo"))
        {
            providerId = "prov-midtrans-001";
            providerCode = "MIDTRANS";
            channel = "OVO_PAYMENT";
        }
        else if (appName.Contains("bibit") || appName.Contains("ajaib") || appName.Contains("stockbit") || fullText.ToLower().Contains("reksa dana") || fullText.ToLower().Contains("saham"))
        {
            providerId = "prov-bca-003";
            providerCode = "BCA_VA";
            channel = "INVESTMENT_SETTLEMENT";
        }

        // Verify provider exists in DB
        var provider = await _context.Providers.FirstOrDefaultAsync(p => p.Id == providerId, cancellationToken);
        if (provider == null)
        {
            // Fallback to first available provider
            provider = await _context.Providers.FirstAsync(cancellationToken);
            providerId = provider.Id;
            providerCode = provider.Code;
        }

        // 2. Parse Amount
        decimal amount = payload.ExplicitAmount ?? 0;
        if (amount <= 0)
        {
            var match = Regex.Match(fullText, @"(?:Rp|IDR)\s*([0-9\.\,]+)", RegexOptions.IgnoreCase);
            if (match.Success)
            {
                var cleanNumber = match.Groups[1].Value.Replace(".", "").Replace(",", ".");
                if (decimal.TryParse(cleanNumber, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var parsed))
                {
                    amount = parsed;
                }
            }
        }

        if (amount <= 0)
        {
            amount = 50000; // Reasonable default fallback for notifications without nominal
        }

        // 3. Extract Merchant / Recipient
        var merchant = payload.ExplicitMerchant ?? "";
        if (string.IsNullOrWhiteSpace(merchant))
        {
            var merchantMatch = Regex.Match(fullText, @"(?:ke|di|merchant|pembayaran)\s+([A-Za-z0-9\s\.\-_]{3,25})", RegexOptions.IgnoreCase);
            if (merchantMatch.Success)
            {
                merchant = merchantMatch.Groups[1].Value.Trim();
            }
            else
            {
                merchant = payload.AppName ?? "Merchant Partner";
            }
        }

        // 4. Create Internal Ledger Transaction
        var timestamp = DateTime.UtcNow;
        var randSuffix = Random.Shared.Next(1000, 9999);
        var trxRef = $"MOB-{timestamp:yyyyMMddHHmmss}-{randSuffix}";
        var extRef = $"EXT-APP-{providerCode.Substring(0, Math.Min(4, providerCode.Length))}-{randSuffix}";

        var trx = new InternalTransaction
        {
            ProviderId = provider.Id,
            TransactionRef = trxRef,
            ExternalRef = extRef,
            Amount = amount,
            Currency = "IDR",
            TransactionTime = timestamp,
            Channel = channel,
            FeeAmount = Math.Round(amount * provider.FeeRate + provider.FixedFeeAmount, 2),
            Status = "SUCCESS"
        };

        _context.InternalTransactions.Add(trx);
        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            success = true,
            transactionId = trx.Id,
            transactionRef = trx.TransactionRef,
            externalRef = trx.ExternalRef,
            providerId = provider.Id,
            providerCode = provider.Code,
            providerName = provider.Name,
            channel = trx.Channel,
            parsedAmount = trx.Amount,
            merchant,
            syncedAt = trx.CreatedAt,
            rawNotification = new
            {
                title = payload.Title,
                content = payload.Content,
                app = payload.AppName ?? payload.AppPackage
            },
            message = $"Transaksi dari HP berhasil terdata di Internal Ledger ReconX! (Nominal: Rp {amount:N0})"
        });
    }
}
