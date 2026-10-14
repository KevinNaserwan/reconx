using Microsoft.EntityFrameworkCore;
using ReconX.Domain.Entities;
using ReconX.Domain.Enums;

namespace ReconX.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Providers.AnyAsync())
        {
            return; // Already seeded
        }

        var midtrans = new Provider
        {
            Id = "prov-midtrans-001",
            Code = "MIDTRANS",
            Name = "Midtrans Payment Gateway",
            FeeCalculationType = FeeCalculationType.Percentage,
            FeeRate = 0.0150m, // 1.5% MDR
            FixedFeeAmount = 0m,
            IsActive = true
        };

        var xendit = new Provider
        {
            Id = "prov-xendit-002",
            Code = "XENDIT",
            Name = "Xendit XenPlatform",
            FeeCalculationType = FeeCalculationType.Fixed,
            FeeRate = 0m,
            FixedFeeAmount = 4500.0000m, // Rp 4.500 per disbursement
            IsActive = true
        };

        var bca = new Provider
        {
            Id = "prov-bca-003",
            Code = "BCA_VA",
            Name = "Bank Central Asia - Virtual Account",
            FeeCalculationType = FeeCalculationType.Fixed,
            FeeRate = 0m,
            FixedFeeAmount = 2500.0000m,
            IsActive = true
        };

        await context.Providers.AddRangeAsync(midtrans, xendit, bca);
        await context.SaveChangesAsync();

        // Seed Realistic Synthetic Internal Transactions (10 sample transactions)
        var now = DateTime.UtcNow.Date.AddHours(10); // 10:00 AM today
        var internalTrxs = new List<InternalTransaction>
        {
            // Case 1: Exact Match Candidate
            new() {
                Id = "int-001",
                TransactionRef = "TRX-ORD-1001",
                ExternalRef = "EXT-MID-9001",
                ProviderId = midtrans.Id,
                Amount = 250_000.0000m,
                FeeAmount = 3_750.0000m,
                Currency = "IDR",
                TransactionTime = now.AddMinutes(5),
                Channel = "QRIS"
            },
            // Case 2: Exact Match Candidate
            new() {
                Id = "int-002",
                TransactionRef = "TRX-ORD-1002",
                ExternalRef = "EXT-MID-9002",
                ProviderId = midtrans.Id,
                Amount = 1_500_000.0000m,
                FeeAmount = 22_500.0000m,
                Currency = "IDR",
                TransactionTime = now.AddMinutes(15),
                Channel = "CC"
            },
            // Case 3: Amount Mismatch (Internal records 500.000, Provider will report 450.000)
            new() {
                Id = "int-003",
                TransactionRef = "TRX-ORD-1003",
                ExternalRef = "EXT-MID-9003",
                ProviderId = midtrans.Id,
                Amount = 500_000.0000m,
                FeeAmount = 7_500.0000m,
                Currency = "IDR",
                TransactionTime = now.AddMinutes(25),
                Channel = "VA"
            },
            // Case 4: Fee Variance Match Candidate (Internal records gross 100.000, Provider net is 97.500 with 2.500 fee)
            new() {
                Id = "int-004",
                TransactionRef = "TRX-ORD-1004",
                ExternalRef = "EXT-MID-9004",
                ProviderId = midtrans.Id,
                Amount = 100_000.0000m,
                FeeAmount = 2_500.0000m,
                Currency = "IDR",
                TransactionTime = now.AddMinutes(35),
                Channel = "VA"
            },
            // Case 5: Missing in Provider (Exists in internal, never settled by provider)
            new() {
                Id = "int-005",
                TransactionRef = "TRX-ORD-1005",
                ExternalRef = "EXT-MID-9005",
                ProviderId = midtrans.Id,
                Amount = 750_000.0000m,
                FeeAmount = 11_250.0000m,
                Currency = "IDR",
                TransactionTime = now.AddMinutes(45),
                Channel = "QRIS"
            }
        };

        await context.InternalTransactions.AddRangeAsync(internalTrxs);
        await context.SaveChangesAsync();

        // Seed Corresponding Provider Transactions via Import Batch
        var importBatch = new ImportBatch
        {
            Id = "batch-demo-001",
            ProviderId = midtrans.Id,
            FileName = "midtrans_settlement_demo.csv",
            FileSha256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            TotalRecords = 5,
            ProcessedRecords = 5,
            FailedRecords = 0,
            Status = "COMPLETED",
            ImportedBy = "INITIAL_SEED"
        };
        await context.ImportBatches.AddAsync(importBatch);

        var providerTrxs = new List<ProviderTransaction>
        {
            // Matches int-001 exactly
            new() {
                Id = "prv-001",
                ImportBatchId = importBatch.Id,
                ProviderId = midtrans.Id,
                ProviderTrxId = "MID-SETTLE-88001",
                ExternalRef = "EXT-MID-9001",
                GrossAmount = 250_000.0000m,
                FeeAmount = 3_750.0000m,
                NetAmount = 246_250.0000m,
                Currency = "IDR",
                SettlementTime = now.AddMinutes(10)
            },
            // Matches int-002 exactly
            new() {
                Id = "prv-002",
                ImportBatchId = importBatch.Id,
                ProviderId = midtrans.Id,
                ProviderTrxId = "MID-SETTLE-88002",
                ExternalRef = "EXT-MID-9002",
                GrossAmount = 1_500_000.0000m,
                FeeAmount = 22_500.0000m,
                NetAmount = 1_477_500.0000m,
                Currency = "IDR",
                SettlementTime = now.AddMinutes(20)
            },
            // Matches int-003 with Amount Mismatch (450.000 vs 500.000)
            new() {
                Id = "prv-003",
                ImportBatchId = importBatch.Id,
                ProviderId = midtrans.Id,
                ProviderTrxId = "MID-SETTLE-88003",
                ExternalRef = "EXT-MID-9003",
                GrossAmount = 450_000.0000m, // Discrepancy!
                FeeAmount = 6_750.0000m,
                NetAmount = 443_250.0000m,
                Currency = "IDR",
                SettlementTime = now.AddMinutes(30)
            },
            // Matches int-004 via Fee Variance (Net 97.500 + Fee 2.500 = Gross 100.000)
            new() {
                Id = "prv-004",
                ImportBatchId = importBatch.Id,
                ProviderId = midtrans.Id,
                ProviderTrxId = "MID-SETTLE-88004",
                ExternalRef = "EXT-MID-9004",
                GrossAmount = 100_000.0000m,
                FeeAmount = 2_500.0000m,
                NetAmount = 97_500.0000m,
                Currency = "IDR",
                SettlementTime = now.AddMinutes(40)
            },
            // Unmatched in internal (Missing Internal - Provider settled money that internal doesn't have)
            new() {
                Id = "prv-005",
                ImportBatchId = importBatch.Id,
                ProviderId = midtrans.Id,
                ProviderTrxId = "MID-SETTLE-88005-ORPHAN",
                ExternalRef = "EXT-MID-9999-GHOST",
                GrossAmount = 320_000.0000m,
                FeeAmount = 4_800.0000m,
                NetAmount = 315_200.0000m,
                Currency = "IDR",
                SettlementTime = now.AddMinutes(50)
            }
        };

        await context.ProviderTransactions.AddRangeAsync(providerTrxs);
        await context.SaveChangesAsync();
    }
}
