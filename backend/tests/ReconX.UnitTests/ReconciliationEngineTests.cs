using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using ReconX.Application.DTOs;
using ReconX.Application.Services;
using ReconX.Domain.Entities;
using ReconX.Domain.Enums;
using ReconX.Infrastructure.Persistence;
using Xunit;

namespace ReconX.UnitTests;

public class ReconciliationEngineTests
{
    private static AppDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task ExecuteRunAsync_ShouldMatchExactly_WhenReferenceAndGrossAmountAreEqual()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var provider = new Provider { Id = "prov-01", Code = "MIDTRANS", Name = "Midtrans" };
        context.Providers.Add(provider);

        var date = DateTime.UtcNow.Date;
        var internalTrx = new InternalTransaction
        {
            Id = "int-01",
            TransactionRef = "TRX-001",
            ExternalRef = "EXT-001",
            ProviderId = provider.Id,
            Amount = 100_000m,
            Currency = "IDR",
            TransactionTime = date.AddHours(1)
        };
        context.InternalTransactions.Add(internalTrx);

        var providerTrx = new ProviderTransaction
        {
            Id = "prv-01",
            ImportBatchId = "batch-01",
            ProviderId = provider.Id,
            ProviderTrxId = "PG-001",
            ExternalRef = "EXT-001",
            GrossAmount = 100_000m,
            FeeAmount = 1_500m,
            NetAmount = 98_500m,
            Currency = "IDR",
            SettlementTime = date.AddHours(2)
        };
        context.ProviderTransactions.Add(providerTrx);
        await context.SaveChangesAsync();

        var engine = new ReconciliationEngine(context);
        var request = new ReconciliationRunRequestDto(provider.Id, date, date.AddDays(1));

        // Act
        var result = await engine.ExecuteRunAsync(request, "TEST_RUNNER");

        // Assert
        result.TotalProcessed.Should().Be(1);
        result.TotalMatched.Should().Be(1);
        result.TotalDiscrepancy.Should().Be(0);
        result.MatchPercentage.Should().Be(100.00m);

        var matchItem = await context.ReconciliationResults.FirstAsync();
        matchItem.MatchStatus.Should().Be(MatchStatus.Matched);
        matchItem.AmountDifference.Should().Be(0m);
    }

    [Fact]
    public async Task ExecuteRunAsync_ShouldFlagAmountMismatch_AndCreateExceptionCase()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var provider = new Provider { Id = "prov-01", Code = "MIDTRANS", Name = "Midtrans" };
        context.Providers.Add(provider);

        var date = DateTime.UtcNow.Date;
        var internalTrx = new InternalTransaction
        {
            Id = "int-02",
            TransactionRef = "TRX-002",
            ExternalRef = "EXT-002",
            ProviderId = provider.Id,
            Amount = 500_000m,
            Currency = "IDR",
            TransactionTime = date.AddHours(1)
        };
        context.InternalTransactions.Add(internalTrx);

        var providerTrx = new ProviderTransaction
        {
            Id = "prv-02",
            ImportBatchId = "batch-01",
            ProviderId = provider.Id,
            ProviderTrxId = "PG-002",
            ExternalRef = "EXT-002",
            GrossAmount = 450_000m, // 50.000 difference (10% diff exceeds default 5% tolerance)
            FeeAmount = 5_000m,
            NetAmount = 445_000m,
            Currency = "IDR",
            SettlementTime = date.AddHours(2)
        };
        context.ProviderTransactions.Add(providerTrx);
        await context.SaveChangesAsync();

        var engine = new ReconciliationEngine(context);
        var request = new ReconciliationRunRequestDto(provider.Id, date, date.AddDays(1));

        // Act
        var result = await engine.ExecuteRunAsync(request, "TEST_RUNNER");

        // Assert
        result.TotalProcessed.Should().Be(1);
        result.TotalMatched.Should().Be(0);
        result.TotalDiscrepancy.Should().Be(1);
        result.MatchPercentage.Should().Be(0m);

        var matchItem = await context.ReconciliationResults.FirstAsync();
        matchItem.MatchStatus.Should().Be(MatchStatus.AmountMismatch);
        matchItem.AmountDifference.Should().Be(50_000m);

        var exceptionCase = await context.Exceptions.FirstOrDefaultAsync(e => e.ReconResultId == matchItem.Id);
        exceptionCase.Should().NotBeNull();
        exceptionCase!.Status.Should().Be(ExceptionStatus.Open);
        exceptionCase.Severity.Should().Be(ExceptionSeverity.High);
    }

    [Fact]
    public async Task ExecuteRunAsync_ShouldDetectMissingInProvider()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var provider = new Provider { Id = "prov-01", Code = "XENDIT", Name = "Xendit" };
        context.Providers.Add(provider);

        var date = DateTime.UtcNow.Date;
        var internalTrx = new InternalTransaction
        {
            Id = "int-03",
            TransactionRef = "TRX-003",
            ExternalRef = "EXT-GHOST-999",
            ProviderId = provider.Id,
            Amount = 200_000m,
            Currency = "IDR",
            TransactionTime = date.AddHours(3)
        };
        context.InternalTransactions.Add(internalTrx);
        await context.SaveChangesAsync();

        var engine = new ReconciliationEngine(context);
        var request = new ReconciliationRunRequestDto(provider.Id, date, date.AddDays(1));

        // Act
        var result = await engine.ExecuteRunAsync(request, "TEST_RUNNER");

        // Assert
        result.TotalProcessed.Should().Be(1);
        result.TotalDiscrepancy.Should().Be(1);

        var matchItem = await context.ReconciliationResults.FirstAsync();
        matchItem.MatchStatus.Should().Be(MatchStatus.MissingProvider);
        matchItem.AmountDifference.Should().Be(200_000m);
    }
}
