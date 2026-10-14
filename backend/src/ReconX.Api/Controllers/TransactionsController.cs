using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReconX.Application.DTOs;
using ReconX.Application.Interfaces;
using ReconX.Domain.Entities;
using ReconX.Domain.Exceptions;

namespace ReconX.Api.Controllers;

[ApiController]
[Route("api/v1/transactions")]
public class TransactionsController : ControllerBase
{
    private readonly IAppDbContext _context;

    public TransactionsController(IAppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetInternalTransactions(
        [FromQuery] string? providerId,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        var query = _context.InternalTransactions
            .Include(t => t.Provider)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(providerId))
        {
            query = query.Where(t => t.ProviderId == providerId);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(t => t.TransactionRef.ToLower().Contains(s) || 
                                     t.ExternalRef.ToLower().Contains(s));
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(t => t.TransactionTime)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new InternalTransactionResponseDto(
                t.Id,
                t.TransactionRef,
                t.ExternalRef,
                t.ProviderId,
                t.Provider != null ? t.Provider.Name : string.Empty,
                t.Amount,
                t.FeeAmount,
                t.Currency,
                t.TransactionTime,
                t.Channel,
                t.Status,
                t.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        return Ok(new
        {
            total,
            page,
            pageSize,
            items
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateTransaction(
        [FromBody] CreateInternalTransactionDto dto,
        CancellationToken cancellationToken = default)
    {
        var provider = await _context.Providers.FindAsync(new object[] { dto.ProviderId }, cancellationToken);
        if (provider == null)
        {
            throw new DomainException($"Provider ID '{dto.ProviderId}' does not exist.");
        }

        var exists = await _context.InternalTransactions.AnyAsync(t => t.TransactionRef == dto.TransactionRef, cancellationToken);
        if (exists)
        {
            throw new DomainException($"Transaction with reference '{dto.TransactionRef}' already exists.");
        }

        var trx = new InternalTransaction
        {
            TransactionRef = dto.TransactionRef,
            ExternalRef = dto.ExternalRef,
            ProviderId = dto.ProviderId,
            Amount = dto.Amount,
            FeeAmount = dto.FeeAmount,
            Currency = dto.Currency.ToUpperInvariant(),
            TransactionTime = dto.TransactionTime,
            Channel = dto.Channel
        };

        _context.InternalTransactions.Add(trx);
        await _context.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetInternalTransactions), new { id = trx.Id }, trx);
    }
}
