using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReconX.Application.Interfaces;
using ReconX.Domain.Enums;

namespace ReconX.Api.Controllers;

[ApiController]
[Route("api/v1/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly IAppDbContext _context;

    public DashboardController(IAppDbContext context)
    {
        _context = context;
    }

    [HttpGet("metrics")]
    public async Task<IActionResult> GetDashboardMetrics(CancellationToken cancellationToken)
    {
        var totalInternalTrx = await _context.InternalTransactions.CountAsync(cancellationToken);
        var totalInternalAmount = await _context.InternalTransactions.SumAsync(t => (decimal?)t.Amount, cancellationToken) ?? 0m;

        var totalProviderTrx = await _context.ProviderTransactions.CountAsync(cancellationToken);
        var totalProviderAmount = await _context.ProviderTransactions.SumAsync(p => (decimal?)p.GrossAmount, cancellationToken) ?? 0m;

        var totalRuns = await _context.ReconciliationRuns.CountAsync(cancellationToken);
        var totalMatchedResults = await _context.ReconciliationResults
            .CountAsync(r => r.MatchStatus == MatchStatus.Matched || r.MatchStatus == MatchStatus.MatchedWithFeeVariance, cancellationToken);
        
        var totalResults = await _context.ReconciliationResults.CountAsync(cancellationToken);
        var overallMatchRate = totalResults > 0
            ? Math.Round((decimal)totalMatchedResults / totalResults * 100m, 2, MidpointRounding.ToEven)
            : 0m;

        var openExceptionsCount = await _context.Exceptions
            .CountAsync(e => e.Status == ExceptionStatus.Open || e.Status == ExceptionStatus.UnderInvestigation, cancellationToken);

        var totalDiscrepancyAmount = await _context.ReconciliationResults
            .Where(r => r.MatchStatus != MatchStatus.Matched && r.MatchStatus != MatchStatus.MatchedWithFeeVariance)
            .SumAsync(r => (decimal?)r.AmountDifference, cancellationToken) ?? 0m;

        var discrepancyBreakdown = await _context.ReconciliationResults
            .GroupBy(r => r.MatchStatus)
            .Select(g => new
            {
                Status = g.Key.ToString(),
                Count = g.Count(),
                TotalAmount = g.Sum(x => x.AmountDifference)
            })
            .ToListAsync(cancellationToken);

        var providers = await _context.Providers
            .Where(p => p.IsActive)
            .Select(p => new
            {
                p.Id,
                p.Code,
                p.Name,
                p.FeeRate,
                p.FixedFeeAmount
            })
            .ToListAsync(cancellationToken);

        return Ok(new
        {
            kpis = new
            {
                totalInternalVolume = totalInternalAmount,
                totalInternalCount = totalInternalTrx,
                totalProviderVolume = totalProviderAmount,
                totalProviderCount = totalProviderTrx,
                overallMatchRate,
                openExceptionsCount,
                totalDiscrepancyAmount,
                totalRuns
            },
            discrepancyBreakdown,
            providers
        });
    }
}
