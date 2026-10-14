using ReconX.Domain.Entities;

namespace ReconX.Application.Interfaces;

public interface IIdempotencyService
{
    Task<IdempotencyRecord?> GetRecordAsync(string key, CancellationToken cancellationToken = default);
    Task SaveRecordAsync(string key, string endpoint, string requestHash, int responseCode, string responseBody, TimeSpan duration, CancellationToken cancellationToken = default);
}
