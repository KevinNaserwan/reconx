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
            amount = 50000;
        }

        // 4. Extract Merchant / Recipient
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
                merchant = payload.AppName ?? providerName;
            }
        }

        var timestamp = DateTime.UtcNow;

        // 5. CRITICAL: Cross-Channel Anti-Deduplication Engine (±20 minutes window)
        var windowStart = timestamp.AddMinutes(-20);
        var windowEnd = timestamp.AddMinutes(20);

        var existingDuplicate = await _context.InternalTransactions
            .FirstOrDefaultAsync(t => 
                t.ProviderId == provider.Id && 
                t.Amount == amount && 
                t.TransactionTime >= windowStart && 
                t.TransactionTime <= windowEnd, 
                cancellationToken);

        if (existingDuplicate != null)
        {
            // ENRICH EXISTING RECORD WITHOUT DOUBLE-COUNTING!
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
                parsedAmount = existingDuplicate.Amount,
                merchant,
                syncedAt = DateTime.UtcNow,
                message = $"Deduplikasi Cerdas: Transaksi {providerCode} senilai Rp {amount:N0} sudah terdata dari bukti lain (Email/App). Data digabungkan dan nominal TIDAK diduplikasi!"
            });
        }

        // 6. Create Internal Ledger Transaction if brand new
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
