using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReconX.Application.DTOs;
using ReconX.Application.Interfaces;
using ReconX.Domain.Enums;
using ReconX.Domain.Exceptions;

namespace ReconX.Api.Controllers;

[ApiController]
[Route("api/v1/reconciliation")]
public class ReconciliationController : ControllerBase
{
    private readonly IAppDbContext _context;
    private readonly IReconciliationEngine _engine;

    public ReconciliationController(IAppDbContext context, IReconciliationEngine engine)
    {
        _context = context;
        _engine = engine;
    }

    [HttpPost("run")]
    public async Task<IActionResult> ExecuteRun(
        [FromBody] ReconciliationRunRequestDto request,
        CancellationToken cancellationToken)
    {
        var summary = await _engine.ExecuteRunAsync(request, "OPERATOR", cancellationToken);
        return Ok(summary);
    }

    [HttpGet("runs")]
    public async Task<IActionResult> GetRuns(CancellationToken cancellationToken)
    {
        var runs = await _context.ReconciliationRuns
            .Include(r => r.Provider)
            .Include(r => r.Results)
            .OrderByDescending(r => r.StartedAt)
            .Select(r => new ReconciliationSummaryDto(
                r.Id,
                r.RunNumber,
                r.Provider != null ? r.Provider.Code : string.Empty,
                r.Provider != null ? r.Provider.Name : string.Empty,
                r.CutoffStart,
                r.CutoffEnd,
                r.Results.Count,
                r.TotalMatched,
                r.TotalDiscrepancy,
                r.Results.Count > 0 
                    ? Math.Round((decimal)r.TotalMatched / r.Results.Count * 100m, 2, MidpointRounding.ToEven) 
                    : 0m,
                r.TotalInternalAmount,
                r.TotalProviderAmount,
                r.Results.Where(res => res.MatchStatus != MatchStatus.Matched && res.MatchStatus != MatchStatus.MatchedWithFeeVariance).Sum(res => res.AmountDifference),
                r.Status,
                r.StartedAt,
                r.CompletedAt
            ))
            .ToListAsync(cancellationToken);

        return Ok(runs);
    }

    [HttpGet("runs/{runId}/results")]
    public async Task<IActionResult> GetRunResults(
        [FromRoute] string runId,
        [FromQuery] MatchStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        var query = _context.ReconciliationResults
            .Include(r => r.InternalTransaction)
            .Include(r => r.ProviderTransaction)
            .Include(r => r.ExceptionCase)
            .Where(r => r.RunId == runId)
            .AsNoTracking();

        if (status.HasValue)
        {
            query = query.Where(r => r.MatchStatus == status.Value);
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(r => r.MatchStatus)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new ReconciliationResultItemDto(
                r.Id,
                r.InternalTransactionId,
                r.InternalTransaction != null ? r.InternalTransaction.TransactionRef : null,
                r.InternalTransaction != null ? r.InternalTransaction.ExternalRef : (r.ProviderTransaction != null ? r.ProviderTransaction.ExternalRef : null),
                r.InternalTransaction != null ? r.InternalTransaction.Amount : null,
                r.ProviderTransactionId,
                r.ProviderTransaction != null ? r.ProviderTransaction.ProviderTrxId : null,
                r.ProviderTransaction != null ? r.ProviderTransaction.GrossAmount : null,
                r.ProviderTransaction != null ? r.ProviderTransaction.NetAmount : null,
                r.ProviderTransaction != null ? r.ProviderTransaction.FeeAmount : null,
                r.InternalTransaction != null ? r.InternalTransaction.Currency : (r.ProviderTransaction != null ? r.ProviderTransaction.Currency : "IDR"),
                r.MatchStatus,
                r.AmountDifference,
                r.DiscrepancyReason,
                r.CreatedAt,
                r.ExceptionCase != null ? r.ExceptionCase.Id : null,
                r.ExceptionCase != null ? r.ExceptionCase.Status.ToString() : null
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
}
