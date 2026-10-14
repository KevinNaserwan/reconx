using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReconX.Application.DTOs;
using ReconX.Application.Interfaces;
using ReconX.Domain.Entities;
using ReconX.Domain.Exceptions;

namespace ReconX.Api.Controllers;

[ApiController]
[Route("api/v1/imports")]
public class ImportsController : ControllerBase
{
    private readonly IAppDbContext _context;
    private readonly ICsvStreamParser _csvParser;

    public ImportsController(IAppDbContext context, ICsvStreamParser csvParser)
    {
        _context = context;
        _csvParser = csvParser;
    }

    [HttpGet("batches")]
    public async Task<IActionResult> GetImportBatches(CancellationToken cancellationToken)
    {
        var batches = await _context.ImportBatches
            .Include(b => b.Provider)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new ImportBatchSummaryDto(
                b.Id,
                b.ProviderId,
                b.Provider != null ? b.Provider.Code : string.Empty,
                b.Provider != null ? b.Provider.Name : string.Empty,
                b.FileName,
                b.FileSha256,
                b.TotalRecords,
                b.ProcessedRecords,
                b.FailedRecords,
                b.Status,
                b.ErrorSummary,
                b.ImportedBy,
                b.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        return Ok(batches);
    }

    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadProviderCsv(
        [FromForm] string providerId,
        [FromForm] IFormFile file,
        CancellationToken cancellationToken)
    {
        var provider = await _context.Providers.FindAsync(new object[] { providerId }, cancellationToken);
        if (provider == null)
        {
            throw new DomainException($"Provider '{providerId}' not found.");
        }

        if (file == null || file.Length == 0)
        {
            throw new DomainException("CSV file payload is empty.");
        }

        // Calculate SHA-256 for File Deduplication
        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream, cancellationToken);
        var fileBytes = memoryStream.ToArray();
        var fileHash = Convert.ToHexString(SHA256.HashData(fileBytes)).ToLowerInvariant();

        var duplicateBatch = await _context.ImportBatches
            .FirstOrDefaultAsync(b => b.FileSha256 == fileHash, cancellationToken);
        if (duplicateBatch != null)
        {
            return Conflict(new
            {
                message = $"Duplicate settlement file detected. This file was previously imported in batch '{duplicateBatch.Id}' on {duplicateBatch.CreatedAt:yyyy-MM-dd HH:mm:ss} UTC.",
                batchId = duplicateBatch.Id
            });
        }

        memoryStream.Position = 0;
        var (validRows, parseErrors) = await _csvParser.ParseProviderCsvAsync(memoryStream, cancellationToken);

        var batch = new ImportBatch
        {
            ProviderId = provider.Id,
            FileName = file.FileName,
            FileSha256 = fileHash,
            TotalRecords = validRows.Count + parseErrors.Count,
            ProcessedRecords = validRows.Count,
            FailedRecords = parseErrors.Count,
            Status = parseErrors.Count > 0 && validRows.Count == 0 ? "FAILED" : "COMPLETED",
            ErrorSummary = parseErrors.Count > 0 ? string.Join("; ", parseErrors.Take(10)) : null,
            ImportedBy = "OPERATOR"
        };

        _context.ImportBatches.Add(batch);
        await _context.SaveChangesAsync(cancellationToken);

        // Bulk insert valid provider transactions
        var providerTransactions = validRows.Select(row => new ProviderTransaction
        {
            ImportBatchId = batch.Id,
            ProviderId = provider.Id,
            ProviderTrxId = row.ProviderTrxId,
            ExternalRef = row.ExternalRef,
            GrossAmount = row.GrossAmount,
            FeeAmount = row.FeeAmount,
            NetAmount = row.NetAmount,
            Currency = row.Currency,
            SettlementTime = row.SettlementTime
        }).ToList();

        _context.ProviderTransactions.AddRange(providerTransactions);
        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            batchId = batch.Id,
            fileName = file.FileName,
            totalRows = batch.TotalRecords,
            processedRows = batch.ProcessedRecords,
            failedRows = batch.FailedRecords,
            status = batch.Status,
            errors = parseErrors
        });
    }
}
