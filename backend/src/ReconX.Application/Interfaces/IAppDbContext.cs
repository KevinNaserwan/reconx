using Microsoft.EntityFrameworkCore;
using ReconX.Domain.Entities;

namespace ReconX.Application.Interfaces;

public interface IAppDbContext
{
    DbSet<Provider> Providers { get; }
    DbSet<ImportBatch> ImportBatches { get; }
    DbSet<InternalTransaction> InternalTransactions { get; }
    DbSet<ProviderTransaction> ProviderTransactions { get; }
    DbSet<ReconciliationRun> ReconciliationRuns { get; }
    DbSet<ReconciliationResult> ReconciliationResults { get; }
    DbSet<ExceptionCase> Exceptions { get; }
    DbSet<AuditLog> AuditLogs { get; }
    DbSet<IdempotencyRecord> IdempotencyRecords { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
