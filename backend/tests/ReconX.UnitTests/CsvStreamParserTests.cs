using System.Text;
using FluentAssertions;
using ReconX.Application.Services;
using Xunit;

namespace ReconX.UnitTests;

public class CsvStreamParserTests
{
    [Fact]
    public async Task ParseProviderCsvAsync_ShouldExtractValidRows_WhenCsvIsValid()
    {
        // Arrange
        var csvContent = @"provider_trx_id,external_ref,gross_amount,fee_amount,net_amount,currency,settlement_time
PG-TX-1001,EXT-1001,150000.00,2250.00,147750.00,IDR,2026-10-14T08:30:00Z
PG-TX-1002,EXT-1002,250000.00,3750.00,246250.00,IDR,2026-10-14T09:00:00Z";

        using var stream = new MemoryStream(Encoding.UTF8.GetBytes(csvContent));
        var parser = new CsvStreamParser();

        // Act
        var (validRows, errors) = await parser.ParseProviderCsvAsync(stream);

        // Assert
        errors.Should().BeEmpty();
        validRows.Should().HaveCount(2);

        validRows[0].ProviderTrxId.Should().Be("PG-TX-1001");
        validRows[0].GrossAmount.Should().Be(150_000.00m);
        validRows[0].FeeAmount.Should().Be(2_250.00m);
        validRows[0].NetAmount.Should().Be(147_750.00m);
        validRows[0].Currency.Should().Be("IDR");
    }

    [Fact]
    public async Task ParseProviderCsvAsync_ShouldCollectRowErrors_WhenGrossAmountIsMalformed()
    {
        // Arrange
        var csvContent = @"provider_trx_id,external_ref,gross_amount,fee_amount,net_amount,currency,settlement_time
PG-TX-1001,EXT-1001,INVALID_AMOUNT,2250.00,147750.00,IDR,2026-10-14T08:30:00Z";

        using var stream = new MemoryStream(Encoding.UTF8.GetBytes(csvContent));
        var parser = new CsvStreamParser();

        // Act
        var (validRows, errors) = await parser.ParseProviderCsvAsync(stream);

        // Assert
        validRows.Should().BeEmpty();
        errors.Should().ContainSingle()
            .Which.Should().Contain("Invalid 'gross_amount' value 'INVALID_AMOUNT'");
    }
}
