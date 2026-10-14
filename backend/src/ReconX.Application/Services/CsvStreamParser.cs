using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;
using ReconX.Application.DTOs;
using ReconX.Application.Interfaces;

namespace ReconX.Application.Services;

public class CsvStreamParser : ICsvStreamParser
{
    public async Task<(List<ProviderCsvRow> ValidRows, List<string> Errors)> ParseProviderCsvAsync(
        Stream fileStream, 
        CancellationToken cancellationToken = default)
    {
        var validRows = new List<ProviderCsvRow>();
        var errors = new List<string>();

        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
            TrimOptions = TrimOptions.Trim,
            MissingFieldFound = null,
            HeaderValidated = null,
            BadDataFound = context => errors.Add($"Bad CSV data at row {context.Context?.Parser?.Row}: {context.RawRecord}")
        };

        using var reader = new StreamReader(fileStream);
        using var csv = new CsvReader(reader, config);

        if (!await csv.ReadAsync())
        {
            errors.Add("CSV file is empty or missing headers.");
            return (validRows, errors);
        }

        csv.ReadHeader();
        int rowNumber = 1;

        while (await csv.ReadAsync())
        {
            rowNumber++;
            cancellationToken.ThrowIfCancellationRequested();

            try
            {
                var providerTrxId = csv.GetField<string>("provider_trx_id")?.Trim();
                var externalRef = csv.GetField<string>("external_ref")?.Trim() ?? string.Empty;
                var grossAmountStr = csv.GetField<string>("gross_amount");
                var feeAmountStr = csv.GetField<string>("fee_amount");
                var netAmountStr = csv.GetField<string>("net_amount");
                var currency = csv.GetField<string>("currency")?.Trim() ?? "IDR";
                var settlementTimeStr = csv.GetField<string>("settlement_time");

                if (string.IsNullOrWhiteSpace(providerTrxId))
                {
                    errors.Add($"Row {rowNumber}: 'provider_trx_id' cannot be empty.");
                    continue;
                }

                if (!decimal.TryParse(grossAmountStr, NumberStyles.Any, CultureInfo.InvariantCulture, out var grossAmount))
                {
                    errors.Add($"Row {rowNumber}: Invalid 'gross_amount' value '{grossAmountStr}'.");
                    continue;
                }

                decimal.TryParse(feeAmountStr, NumberStyles.Any, CultureInfo.InvariantCulture, out var feeAmount);
                if (!decimal.TryParse(netAmountStr, NumberStyles.Any, CultureInfo.InvariantCulture, out var netAmount))
                {
                    netAmount = grossAmount - feeAmount;
                }

                if (!DateTime.TryParse(settlementTimeStr, CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal, out var settlementTime))
                {
                    settlementTime = DateTime.UtcNow;
                }

                validRows.Add(new ProviderCsvRow(
                    providerTrxId,
                    externalRef,
                    grossAmount,
                    feeAmount,
                    netAmount,
                    currency.ToUpperInvariant(),
                    settlementTime
                ));
            }
            catch (Exception ex)
            {
                errors.Add($"Row {rowNumber}: Unexpected parse error: {ex.Message}");
            }
        }

        return (validRows, errors);
    }
}
