using ReconX.Application.DTOs;

namespace ReconX.Application.Interfaces;

public interface ICsvStreamParser
{
    Task<(List<ProviderCsvRow> ValidRows, List<string> Errors)> ParseProviderCsvAsync(Stream fileStream, CancellationToken cancellationToken = default);
}
