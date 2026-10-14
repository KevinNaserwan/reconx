using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReconX.Application.Interfaces;
using ReconX.Domain.Entities;
using ReconX.Domain.Enums;

namespace ReconX.Api.Controllers;

[ApiController]
[Route("api/v1/email")]
public class EmailReceiptController : ControllerBase
{
    private readonly IAppDbContext _context;

    public EmailReceiptController(IAppDbContext context)
    {
        _context = context;
    }

    public class EmailReceiptPayload
    {
        public string? From { get; set; }
        public string? Subject { get; set; }
        public string? Body { get; set; }
        public DateTime? ReceivedAt { get; set; }
        public string? UserEmail { get; set; }
        public string? InvoiceNumber { get; set; }
        public decimal? ExplicitAmount { get; set; }
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetEmailIngestionStatus(CancellationToken cancellationToken)
    {
        // Count transactions enriched or deduplicated by email
        var deduplicatedCount = await _context.InternalTransactions
            .CountAsync(t => t.Channel.Contains("EMAIL"), cancellationToken);

        return Ok(new
        {
            status = "ONLINE",
            agent = "ReconX Email Receipt & Statement Ingestion Worker",
            inboundEmail = "receipts+kevin.naserwan@reconx.io",
            antiDeduplicationMode = "STRICT_CROSS_CHANNEL_DEDUPLICATION",
            deduplicationWindowMinutes = 20,
            supportedPlatforms = new[]
            {
                "Pluang (Emas, Kripto, Saham AS & Reksa Dana)",
                "Bibit (Reksa Dana & SBN)",
                "Bareksa (Investasi Reksa Dana & Emas)",
                "Ajaib Sekuritas & Kripto",
                "Stockbit (Saham IHSG)",
                "Tokopedia (Invoice Resmi)",
                "Shopee / ShopeePay (Bukti Bayar)",
                "blu by BCA Digital (e-Statement / Mutasi Transaksi)",
                "SeaBank (Bukti Transfer)",
                "Superbank (e-Receipt)"
            },
            stats = new
            {
                deduplicatedOrEnrichedRecords = deduplicatedCount,
                antiDoubleCountingProtection = "ACTIVE"
            }
        });
    }

    [HttpPost("ingest-receipt")]
    public async Task<IActionResult> IngestReceipt(
        [FromBody] EmailReceiptPayload payload,
        CancellationToken cancellationToken)
    {
        if (payload == null || (string.IsNullOrWhiteSpace(payload.Body) && string.IsNullOrWhiteSpace(payload.Subject)))
        {
            return BadRequest(new { success = false, message = "Email payload body and subject cannot be empty." });
        }

        var fullText = $"{payload.Subject} {payload.Body} {payload.From}";
        var timestamp = payload.ReceivedAt ?? DateTime.UtcNow;

        // 1. Detect Provider & Platform
        var providerId = "prov-pluang-008";
        var providerCode = "PLUANG";
        var providerName = "Pluang Indonesia (Emas, Kripto & Saham AS)";
        var channel = "EMAIL_RECEIPT";

        var lowerText = fullText.ToLowerInvariant();
        var fromLower = (payload.From ?? "").ToLowerInvariant();

        if (fromLower.Contains("pluang") || lowerText.Contains("pluang"))
        {
            providerId = "prov-pluang-008";
            providerCode = "PLUANG";
            providerName = "Pluang (Emas, Kripto, Saham AS)";
        }
        else if (fromLower.Contains("bibit") || lowerText.Contains("bibit"))
        {
            providerId = "prov-bibit-009";
            providerCode = "BIBIT";
            providerName = "Bibit Reksadana & SBN";
        }
        else if (fromLower.Contains("bareksa") || lowerText.Contains("bareksa"))
        {
            providerId = "prov-bareksa-010";
            providerCode = "BAREKSA";
            providerName = "Bareksa Portal Investasi";
        }
        else if (fromLower.Contains("ajaib") || lowerText.Contains("ajaib"))
        {
            providerId = "prov-ajaib-011";
            providerCode = "AJAIB";
            providerName = "Ajaib Sekuritas & Kripto";
        }
        else if (fromLower.Contains("stockbit") || lowerText.Contains("stockbit"))
        {
            providerId = "prov-stockbit-012";
            providerCode = "STOCKBIT";
            providerName = "Stockbit Investasi Saham";
        }
        else if (fromLower.Contains("tokopedia") || lowerText.Contains("tokopedia"))
        {
            providerId = "prov-midtrans-001";
            providerCode = "MIDTRANS";
            providerName = "Tokopedia Checkout";
        }
        else if (fromLower.Contains("shopee") || lowerText.Contains("shopee"))
        {
            providerId = "prov-shopeepay-007";
            providerCode = "SHOPEEPAY";
            providerName = "ShopeePay Indonesia";
        }
        else if (fromLower.Contains("bcadigital") || lowerText.Contains("blu"))
        {
            providerId = "prov-blu-004";
            providerCode = "BLU_BCA";
            providerName = "blu by BCA Digital";
        }
        else if (fromLower.Contains("seabank") || lowerText.Contains("seabank"))
        {
            providerId = "prov-seabank-006";
            providerCode = "SEABANK";
            providerName = "SeaBank Indonesia";
        }
        else if (fromLower.Contains("superbank") || lowerText.Contains("superbank"))
        {
            providerId = "prov-superbank-005";
            providerCode = "SUPERBANK";
            providerName = "Superbank Indonesia";
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
                FeeCalculationType = FeeCalculationType.Fixed,
                FeeRate = 0m,
                FixedFeeAmount = 0m,
                IsActive = true
            };
            _context.Providers.Add(provider);
            await _context.SaveChangesAsync(cancellationToken);
        }

        // 3. Extract Nominal Amount
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
            amount = 100000; // Reasonable fallback
        }

        // 4. Extract Invoice / Order ID
        var invoice = payload.InvoiceNumber ?? "";
        if (string.IsNullOrWhiteSpace(invoice))
        {
            var invMatch = Regex.Match(fullText, @"(?:Order|Invoice|Ref|INV|ID)\s*(?:No|Number|#)?[:\s]+([A-Za-z0-9\-_]{5,25})", RegexOptions.IgnoreCase);
            if (invMatch.Success)
            {
                invoice = invMatch.Groups[1].Value.Trim();
            }
            else
            {
                invoice = $"INV-EML-{Random.Shared.Next(100000, 999999)}";
            }
        }

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
            if (!existingDuplicate.Channel.Contains("EMAIL"))
            {
                existingDuplicate.Channel = "HYBRID_NOTIF_AND_EMAIL";
            }
            if (string.IsNullOrWhiteSpace(existingDuplicate.ExternalRef) || existingDuplicate.ExternalRef.StartsWith("EXT-APP"))
            {
                existingDuplicate.ExternalRef = invoice; // Enrich with official invoice number from email
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
                amount = existingDuplicate.Amount,
                syncedAt = DateTime.UtcNow,
                message = $"Deduplikasi Cerdas Berhasil: Transaksi {providerCode} sebesar Rp {amount:N0} sudah terdata dari notifikasi HP. Bukti email digabungkan dan nominal TIDAK diduplikasi!"
            });
        }

        // 6. No existing match found -> Create fresh transaction from email
        var randSuffix = Random.Shared.Next(1000, 9999);
        var trxRef = $"EML-{timestamp:yyyyMMddHHmmss}-{randSuffix}";

        var trx = new InternalTransaction
        {
            ProviderId = provider.Id,
            TransactionRef = trxRef,
            ExternalRef = invoice,
            Amount = amount,
            Currency = "IDR",
            TransactionTime = timestamp,
            Channel = "EMAIL_RECEIPT",
            FeeAmount = 0m,
            Status = "SUCCESS"
        };

        _context.InternalTransactions.Add(trx);
        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            success = true,
            isDuplicate = false,
            action = "INSERTED_NEW_RECORD",
            transactionId = trx.Id,
            transactionRef = trx.TransactionRef,
            externalRef = trx.ExternalRef,
            providerId = provider.Id,
            providerCode = provider.Code,
            providerName = provider.Name,
            channel = trx.Channel,
            amount = trx.Amount,
            syncedAt = trx.CreatedAt,
            message = $"Bukti transaksi email {providerCode} sebesar Rp {amount:N0} berhasil dicatat di Internal Ledger!"
        });
    }
}
