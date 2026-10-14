using ReconX.Application.DTOs;

namespace ReconX.Application.Interfaces;

public interface IReconciliationEngine
{
    Task<ReconciliationSummaryDto> ExecuteRunAsync(ReconciliationRunRequestDto request, string executedBy, CancellationToken cancellationToken = default);
}
