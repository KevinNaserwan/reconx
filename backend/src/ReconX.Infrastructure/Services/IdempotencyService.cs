using Microsoft.EntityFrameworkCore;
using ReconX.Application.Interfaces;
using ReconX.Domain.Entities;

namespace ReconX.Infrastructure.Services;

public class IdempotencyService : IIdempotencyService
{
    private readonly IAppDbContext _context;

    public IdempotencyService(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<IdempotencyRecord?> GetRecordAsync(string key, CancellationToken cancellationToken = default)
    {
        var record = await _context.IdempotencyRecords
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Key == key, cancellationToken);

        if (record != null && record.ExpiresAt < DateTime.UtcNow)
        {
            return null; // Expired
        }

        return record;
    }

    public async Task SaveRecordAsync(
        string key, 
        string endpoint, 
        string requestHash, 
        int responseCode, 
        string responseBody, 
        TimeSpan duration, 
        CancellationToken cancellationToken = default)
    {
        var existing = await _context.IdempotencyRecords
            .FirstOrDefaultAsync(r => r.Key == key, cancellationToken);

        if (existing != null)
        {
            existing.ResponseCode = responseCode;
            existing.ResponseBody = responseBody;
            existing.ExpiresAt = DateTime.UtcNow.Add(duration);
        }
        else
        {
            _context.IdempotencyRecords.Add(new IdempotencyRecord
            {
                Key = key,
                Endpoint = endpoint,
                RequestHash = requestHash,
                ResponseCode = responseCode,
                ResponseBody = responseBody,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.Add(duration)
            });
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
