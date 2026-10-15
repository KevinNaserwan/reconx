using Microsoft.EntityFrameworkCore;
using ReconX.Application.Interfaces;
using ReconX.Domain.Entities;

namespace ReconX.Infrastructure.Persistence;

public class AppDbContext : DbContext, IAppDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Provider> Providers => Set<Provider>();
    public DbSet<ImportBatch> ImportBatches => Set<ImportBatch>();
    public DbSet<InternalTransaction> InternalTransactions => Set<InternalTransaction>();
    public DbSet<ProviderTransaction> ProviderTransactions => Set<ProviderTransaction>();
    public DbSet<ReconciliationRun> ReconciliationRuns => Set<ReconciliationRun>();
    public DbSet<ReconciliationResult> ReconciliationResults => Set<ReconciliationResult>();
    public DbSet<ExceptionCase> Exceptions => Set<ExceptionCase>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<IdempotencyRecord> IdempotencyRecords => Set<IdempotencyRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Providers
        modelBuilder.Entity<Provider>(entity =>
        {
            entity.ToTable("providers");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Code).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.FeeRate).HasColumnType("numeric(8, 4)");
            entity.Property(e => e.FixedFeeAmount).HasColumnType("numeric(18, 4)");
        });

        // Import Batches
        modelBuilder.Entity<ImportBatch>(entity =>
        {
            entity.ToTable("import_batches");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.FileSha256).IsUnique();
            entity.Property(e => e.FileName).HasMaxLength(255).IsRequired();
            entity.Property(e => e.FileSha256).HasMaxLength(64).IsRequired();
            entity.HasOne(e => e.Provider)
                  .WithMany(p => p.ImportBatches)
                  .HasForeignKey(e => e.ProviderId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Internal Transactions
        modelBuilder.Entity<InternalTransaction>(entity =>
        {
            entity.ToTable("internal_transactions");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TransactionRef).IsUnique();
            entity.HasIndex(e => new { e.ExternalRef, e.ProviderId });
            entity.Property(e => e.Amount).HasColumnType("numeric(18, 4)");
            entity.Property(e => e.FeeAmount).HasColumnType("numeric(18, 4)");
            entity.Property(e => e.Currency).HasMaxLength(3).IsRequired();
            entity.Property(e => e.Type).HasMaxLength(20).HasDefaultValue("EXPENSE");
            entity.HasOne(e => e.Provider)
                  .WithMany(p => p.InternalTransactions)
                  .HasForeignKey(e => e.ProviderId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Provider Transactions
        modelBuilder.Entity<ProviderTransaction>(entity =>
        {
            entity.ToTable("provider_transactions");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.ExternalRef, e.ProviderId });
            entity.Property(e => e.GrossAmount).HasColumnType("numeric(18, 4)");
            entity.Property(e => e.FeeAmount).HasColumnType("numeric(18, 4)");
            entity.Property(e => e.NetAmount).HasColumnType("numeric(18, 4)");
            entity.Property(e => e.Currency).HasMaxLength(3).IsRequired();
            entity.HasOne(e => e.ImportBatch)
                  .WithMany(b => b.Transactions)
                  .HasForeignKey(e => e.ImportBatchId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Provider)
                  .WithMany(p => p.ProviderTransactions)
                  .HasForeignKey(e => e.ProviderId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Reconciliation Runs
        modelBuilder.Entity<ReconciliationRun>(entity =>
        {
            entity.ToTable("reconciliation_runs");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.RunNumber).IsUnique();
            entity.Property(e => e.TotalInternalAmount).HasColumnType("numeric(18, 4)");
            entity.Property(e => e.TotalProviderAmount).HasColumnType("numeric(18, 4)");
            entity.HasOne(e => e.Provider)
                  .WithMany(p => p.ReconciliationRuns)
                  .HasForeignKey(e => e.ProviderId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Reconciliation Results
        modelBuilder.Entity<ReconciliationResult>(entity =>
        {
            entity.ToTable("reconciliation_results");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AmountDifference).HasColumnType("numeric(18, 4)");
            entity.HasOne(e => e.Run)
                  .WithMany(r => r.Results)
                  .HasForeignKey(e => e.RunId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.InternalTransaction)
                  .WithMany(t => t.ReconciliationResults)
                  .HasForeignKey(e => e.InternalTransactionId)
                  .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.ProviderTransaction)
                  .WithMany(t => t.ReconciliationResults)
                  .HasForeignKey(e => e.ProviderTransactionId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // Exceptions
        modelBuilder.Entity<ExceptionCase>(entity =>
        {
            entity.ToTable("exceptions");
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.ReconResult)
                  .WithOne(r => r.ExceptionCase)
                  .HasForeignKey<ExceptionCase>(e => e.ReconResultId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Audit Logs
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("audit_logs");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.EntityName, e.EntityId });
        });

        // Idempotency Records
        modelBuilder.Entity<IdempotencyRecord>(entity =>
        {
            entity.ToTable("idempotency_records");
            entity.HasKey(e => e.Key);
        });
    }
}
