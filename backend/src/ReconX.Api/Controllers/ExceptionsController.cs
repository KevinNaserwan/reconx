using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReconX.Application.DTOs;
using ReconX.Application.Interfaces;
using ReconX.Domain.Entities;
using ReconX.Domain.Enums;
using ReconX.Domain.Exceptions;

namespace ReconX.Api.Controllers;

[ApiController]
[Route("api/v1/exceptions")]
public class ExceptionsController : ControllerBase
{
    private readonly IAppDbContext _context;

    public ExceptionsController(IAppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetExceptions(
        [FromQuery] ExceptionStatus? status,
        [FromQuery] ExceptionSeverity? severity,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Exceptions
            .Include(e => e.ReconResult)
                .ThenInclude(r => r!.Run)
            .Include(e => e.ReconResult)
                .ThenInclude(r => r!.InternalTransaction)
            .Include(e => e.ReconResult)
                .ThenInclude(r => r!.ProviderTransaction)
            .AsNoTracking();

        if (status.HasValue)
        {
            query = query.Where(e => e.Status == status.Value);
        }

        if (severity.HasValue)
        {
            query = query.Where(e => e.Severity == severity.Value);
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(e => e.Severity)
            .ThenByDescending(e => e.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(e => new ExceptionCaseDto(
                e.Id,
                e.ReconResultId,
                e.ReconResult != null && e.ReconResult.Run != null ? e.ReconResult.Run.RunNumber : string.Empty,
                e.ReconResult != null && e.ReconResult.InternalTransaction != null 
                    ? e.ReconResult.InternalTransaction.ExternalRef 
                    : (e.ReconResult != null && e.ReconResult.ProviderTransaction != null ? e.ReconResult.ProviderTransaction.ExternalRef : null),
                e.ReconResult != null && e.ReconResult.InternalTransaction != null ? e.ReconResult.InternalTransaction.TransactionRef : null,
                e.ReconResult != null && e.ReconResult.ProviderTransaction != null ? e.ReconResult.ProviderTransaction.ProviderTrxId : null,
                e.ReconResult != null ? e.ReconResult.AmountDifference : 0m,
                e.ReconResult != null ? e.ReconResult.MatchStatus : MatchStatus.Pending,
                e.ReconResult != null ? e.ReconResult.DiscrepancyReason : null,
                e.AssignedTo,
                e.Severity,
                e.Status,
                e.ResolutionType,
                e.ResolutionNotes,
                e.ResolvedBy,
                e.ResolvedAt,
                e.CreatedAt,
                e.UpdatedAt
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

    [HttpPost("{id}/assign")]
    public async Task<IActionResult> AssignOperator(
        [FromRoute] string id,
        [FromBody] AssignExceptionRequestDto request,
        CancellationToken cancellationToken)
    {
        var caseItem = await _context.Exceptions.FindAsync(new object[] { id }, cancellationToken);
        if (caseItem == null)
        {
            throw new DomainException($"Exception case '{id}' not found.");
        }

        var previousAssignee = caseItem.AssignedTo;
        caseItem.AssignedTo = request.AssignedTo;
        caseItem.Status = ExceptionStatus.UnderInvestigation;
        caseItem.UpdatedAt = DateTime.UtcNow;

        _context.AuditLogs.Add(new AuditLog
        {
            EntityName = "EXCEPTION",
            EntityId = caseItem.Id,
            Action = "ASSIGN_OPERATOR",
            ActorUsername = "OPERATOR",
            PreviousState = $"{{\"assignedTo\":\"{previousAssignee}\"}}",
            NewState = $"{{\"assignedTo\":\"{request.AssignedTo}\",\"status\":\"UnderInvestigation\"}}"
        });

        await _context.SaveChangesAsync(cancellationToken);
        return Ok(caseItem);
    }

    [HttpPost("{id}/resolve")]
    public async Task<IActionResult> ResolveException(
        [FromRoute] string id,
        [FromBody] ResolveExceptionRequestDto request,
        CancellationToken cancellationToken)
    {
        var caseItem = await _context.Exceptions.FindAsync(new object[] { id }, cancellationToken);
        if (caseItem == null)
        {
            throw new DomainException($"Exception case '{id}' not found.");
        }

        if (string.IsNullOrWhiteSpace(request.ResolutionNotes))
        {
            throw new DomainException("Resolution notes are mandatory for financial audit compliance.");
        }

        var previousStatus = caseItem.Status.ToString();
        caseItem.Status = ExceptionStatus.Resolved;
        caseItem.ResolutionType = request.ResolutionType;
        caseItem.ResolutionNotes = request.ResolutionNotes;
        caseItem.ResolvedBy = request.ResolvedBy;
        caseItem.ResolvedAt = DateTime.UtcNow;
        caseItem.UpdatedAt = DateTime.UtcNow;

        _context.AuditLogs.Add(new AuditLog
        {
            EntityName = "EXCEPTION",
            EntityId = caseItem.Id,
            Action = "RESOLVE_EXCEPTION",
            ActorUsername = request.ResolvedBy,
            PreviousState = $"{{\"status\":\"{previousStatus}\"}}",
            NewState = $"{{\"status\":\"Resolved\",\"resolutionType\":\"{request.ResolutionType}\",\"notes\":\"{request.ResolutionNotes}\"}}"
        });

        await _context.SaveChangesAsync(cancellationToken);
        return Ok(caseItem);
    }
}
