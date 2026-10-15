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
        public string? Type { get; set; } // INCOME or EXPENSE
        public string? Member { get; set; }
        public string? Category { get; set; }
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
        var providerName = "blu by BCA Digital";
        var channel = "MOBILE_AUTO_SYNC";

        var pkg = (payload.AppPackage ?? "").ToLowerInvariant();
        var appName = (payload.AppName ?? "").ToLowerInvariant();

        if (pkg.Contains("bcadigital") || appName.Contains("blu"))
        {
            providerId = "prov-blu-004";
            providerCode = "BLU_BCA";
            providerName = "blu by BCA Digital";
            channel = "BLU_QRIS_OR_TRANSFER";
        }
        else if (pkg.Contains("pluang") || appName.Contains("pluang") || fullText.ToLower().Contains("pluang"))
        {
            providerId = "prov-pluang-008";
            providerCode = "PLUANG";
            providerName = "Pluang (Emas, Kripto, Saham AS)";
            channel = "INVESTMENT_PLUANG";
        }
        else if (pkg.Contains("bibit") || appName.Contains("bibit") || fullText.ToLower().Contains("bibit"))
        {
            providerId = "prov-bibit-009";
            providerCode = "BIBIT";
            providerName = "Bibit Reksadana & SBN";
            channel = "INVESTMENT_BIBIT";
        }
        else if (pkg.Contains("bareksa") || appName.Contains("bareksa") || fullText.ToLower().Contains("bareksa"))
        {
            providerId = "prov-bareksa-010";
            providerCode = "BAREKSA";
            providerName = "Bareksa Portal Investasi";
            channel = "INVESTMENT_BAREKSA";
        }
        else if (pkg.Contains("ajaib") || appName.Contains("ajaib") || fullText.ToLower().Contains("ajaib"))
        {
            providerId = "prov-ajaib-011";
            providerCode = "AJAIB";
            providerName = "Ajaib Sekuritas & Kripto";
            channel = "INVESTMENT_AJAIB";
        }
        else if (pkg.Contains("stockbit") || appName.Contains("stockbit") || fullText.ToLower().Contains("stockbit"))
        {
            providerId = "prov-stockbit-012";
            providerCode = "STOCKBIT";
            providerName = "Stockbit Investasi Saham";
            channel = "INVESTMENT_STOCKBIT";
        }
        else if (pkg.Contains("searpm") || pkg.Contains("seabank") || appName.Contains("seabank"))
        {
            providerId = "prov-seabank-006";
            providerCode = "SEABANK";
            providerName = "SeaBank Indonesia";
            channel = "SEABANK_QRIS";
        }
        else if (pkg.Contains("superbank") || appName.Contains("superbank"))
        {
            providerId = "prov-superbank-005";
            providerCode = "SUPERBANK";
            providerName = "Superbank Indonesia";
            channel = "SUPERBANK_BIFAST";
        }
        else if (pkg.Contains("shopee") || appName.Contains("shopeepay"))
        {
            providerId = "prov-shopeepay-007";
            providerCode = "SHOPEEPAY";
            providerName = "ShopeePay Indonesia";
            channel = "SHOPEEPAY_WALLET";
        }
        else if (pkg.Contains("tokopedia") || appName.Contains("tokopedia"))
        {
            providerId = "prov-midtrans-001";
            providerCode = "MIDTRANS";
            providerName = "Tokopedia Checkout";
            channel = "TOKOPEDIA_CHECKOUT";
        }
        else if (pkg.Contains("ovo") || appName.Contains("ovo"))
        {
            providerId = "prov-midtrans-001";
            providerCode = "MIDTRANS";
            providerName = "OVO Payment";
            channel = "OVO_PAYMENT";
        }
        else if (fullText.ToLower().Contains("reksa dana") || fullText.ToLower().Contains("saham"))
        {
            providerId = "prov-bca-003";
            providerCode = "BCA_VA";
            providerName = "Bank Central Asia - Virtual Account";
            channel = "INVESTMENT_SETTLEMENT";
        }

        // 2. Ensure Provider exists in Database dynamically
        var provider = await _context.Providers.FirstOrDefaultAsync(p => p.Id == providerId, cancellationToken);
        if (provider == null)
        {
            provider = new Provider
            {
                Id = providerId,
                Code = providerCode,
                Name = providerName,
                FeeCalculationType = ReconX.Domain.Enums.FeeCalculationType.Fixed,
                FeeRate = 0m,
                FixedFeeAmount = 0m,
                IsActive = true
            };
            _context.Providers.Add(provider);
            await _context.SaveChangesAsync(cancellationToken);
        }

        // 3. Parse Amount
        decimal amount = payload.ExplicitAmount ?? 0;
        if (amount <= 0)
        {
            // Intelligent regex parsing: Match Rp / IDR prefix
            var rpMatch = Regex.Match(fullText, @"(?:Rp|IDR)\s*[:.]?\s*([0-9\.\,\s]+)", RegexOptions.IgnoreCase);
            if (rpMatch.Success)
            {
                var clean = rpMatch.Groups[1].Value.Trim();
                if (clean.EndsWith(",00") || clean.EndsWith(".00"))
                {
                    clean = clean.Substring(0, clean.Length - 3);
                }
                clean = Regex.Replace(clean, @"[^\d]", "");
                if (decimal.TryParse(clean, out var parsed) && parsed > 0)
                {
                    amount = parsed;
                }
            }

            // Fallback: Indonesian thousands dot format (e.g. 10.500 or 150.000)
            if (amount <= 0)
            {
                var dotMatch = Regex.Match(fullText, @"(?:^|[^\d])([0-9]{1,3}(?:[.,][0-9]{3})+)(?:[^\d]|$)", RegexOptions.IgnoreCase);
                if (dotMatch.Success)
                {
                    var clean = Regex.Replace(dotMatch.Groups[1].Value, @"[^\d]", "");
                    if (decimal.TryParse(clean, out var parsed) && parsed > 0)
                    {
                        amount = parsed;
                    }
                }
            }
        }

        // If amount could not be determined, return informative response without inventing fake numbers
        if (amount <= 0)
        {
            return BadRequest(new { success = false, message = "Nominal transaksi tidak terdeteksi dari notifikasi." });
        }

        // 4. Determine Transaction Type (Uang Masuk / INCOME vs Uang Keluar / EXPENSE)
        var lowerText = fullText.ToLowerInvariant();
        var isIncome = !string.IsNullOrEmpty(payload.Type)
            ? (payload.Type.Equals("INCOME", StringComparison.OrdinalIgnoreCase) || payload.Type.Equals("CREDIT", StringComparison.OrdinalIgnoreCase))
            : (lowerText.Contains("transfer masuk") ||
               lowerText.Contains("dana masuk") ||
               lowerText.Contains("uang masuk") ||
               lowerText.Contains("terima uang") ||
               lowerText.Contains("menerima") ||
               lowerText.Contains("top up berhasil") ||
               lowerText.Contains("topup berhasil") ||
               lowerText.Contains("setoran") ||
               lowerText.Contains("kredit") ||
               lowerText.Contains("cashback") ||
               lowerText.Contains("dikredit"));

        var trxType = isIncome ? "INCOME" : "EXPENSE";

        // 5. Extract Merchant / Recipient
        var merchant = payload.ExplicitMerchant ?? "";
        if (string.IsNullOrWhiteSpace(merchant))
        {
            var merchantMatch = Regex.Match(fullText, @"(?:ke|di|merchant|pembayaran|dari)\s+([A-Za-z0-9\s\.\-_]{3,28})", RegexOptions.IgnoreCase);
            if (merchantMatch.Success)
            {
                merchant = merchantMatch.Groups[1].Value.Trim();
            }
            else
            {
                merchant = payload.AppName ?? providerName;
            }
        }

        var timestamp = DateTime.UtcNow;

        // 6. Precise Rapid-Duplicate Prevention Window (45s window to catch double OS broadcasts, without blocking legitimate repeated purchases)
        var windowStart = timestamp.AddSeconds(-45);
        var windowEnd = timestamp.AddSeconds(45);

        var existingDuplicate = await _context.InternalTransactions
            .FirstOrDefaultAsync(t => 
                t.ProviderId == provider.Id && 
                t.Amount == amount && 
                t.Type == trxType &&
                t.TransactionTime >= windowStart && 
                t.TransactionTime <= windowEnd, 
                cancellationToken);

        if (existingDuplicate != null)
        {
            // ENRICH EXISTING RECORD WITHOUT DOUBLE-COUNTING
            if (!existingDuplicate.Channel.Contains("NOTIF"))
            {
                existingDuplicate.Channel = "HYBRID_NOTIF_AND_EMAIL";
            }

            await _context.SaveChangesAsync(cancellationToken);

            return Ok(new
            {
                success = true,
                isDuplicate = true,
                action = "DEDUPLICATED_AND_ENRICHED",
                transactionId = existingDuplicate.Id,
                transactionRef = existingDuplicate.TransactionRef,
                externalRef = existingDuplicate.ExternalRef,
                providerId = provider.Id,
                providerCode = provider.Code,
                providerName = provider.Name,
                channel = existingDuplicate.Channel,
                type = existingDuplicate.Type,
                parsedAmount = existingDuplicate.Amount,
                merchant,
                syncedAt = DateTime.UtcNow,
                message = $"Deduplikasi Cerdas: Transaksi {providerCode} {trxType} senilai Rp {amount:N0} sudah terdata dari bukti lain. Nominal TIDAK diduplikasi!"
            });
        }

        // 7. Create Internal Ledger Transaction
        var randSuffix = Random.Shared.Next(1000, 9999);
        var trxRef = $"MOB-{timestamp:yyyyMMddHHmmss}-{randSuffix}";
        var memberTag = !string.IsNullOrWhiteSpace(payload.Member) ? $"[{payload.Member}] " : "";
        var extRef = $"{memberTag}EXT-APP-{providerCode.Substring(0, Math.Min(4, providerCode.Length))}-{randSuffix}";

        var trx = new InternalTransaction
        {
            ProviderId = provider.Id,
            TransactionRef = trxRef,
            ExternalRef = extRef,
            Amount = amount,
            Currency = "IDR",
            TransactionTime = timestamp,
            Channel = channel,
            Type = trxType,
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
            type = trx.Type,
            parsedAmount = trx.Amount,
            merchant,
            syncedAt = trx.CreatedAt,
            rawNotification = new
            {
                title = payload.Title,
                content = payload.Content,
                app = payload.AppName ?? payload.AppPackage
            },
            message = $"Transaksi {trxType} dari HP berhasil dicatat di Internal Ledger ReconX! (Nominal: Rp {amount:N0})"
        });
    }
}
