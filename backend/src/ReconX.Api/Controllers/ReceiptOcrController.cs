using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text.Json;

namespace ReconX.Api.Controllers;

[ApiController]
[Route("api/v1/ocr")]
public class ReceiptOcrController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ReceiptOcrController> _logger;

    public ReceiptOcrController(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<ReceiptOcrController> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetOcrEngineStatus(CancellationToken cancellationToken)
    {
        var ocrUrl = _configuration["OcrServiceUrl"] ?? "http://localhost:5055";
        try
        {
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(3);
            var response = await client.GetAsync($"{ocrUrl}/health", cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync(cancellationToken);
                return Content(content, "application/json");
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning("PaddleOCR health check failed: {Message}", ex.Message);
        }

        return Ok(new
        {
            status = "FALLBACK_READY",
            engine = "PaddleOCR PP-OCRv4 (Service offline, ML Kit client fallback enabled)",
            version = "2.9.1"
        });
    }

    [HttpPost("scan-receipt")]
    public async Task<IActionResult> ScanReceipt(IFormFile? file, CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { success = false, message = "File gambar nota atau bukti transfer wajib diunggah." });
        }

        var ocrUrl = _configuration["OcrServiceUrl"] ?? "http://localhost:5055";

        try
        {
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(25);

            using var content = new MultipartFormDataContent();
            using var fileStream = file.OpenReadStream();
            using var streamContent = new StreamContent(fileStream);
            streamContent.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType ?? "image/jpeg");
            content.Add(streamContent, "file", file.FileName ?? "receipt.jpg");

            var response = await client.PostAsync($"{ocrUrl}/ocr/scan", content, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var jsonResult = await response.Content.ReadAsStringAsync(cancellationToken);
                return Content(jsonResult, "application/json");
            }

            var errBody = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError("PaddleOCR service returned error: {StatusCode} {Body}", response.StatusCode, errBody);
            return StatusCode((int)response.StatusCode, new
            {
                success = false,
                message = "Gagal memproses OCR via PaddleOCR Engine.",
                detail = errBody
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception calling PaddleOCR service at {Url}", ocrUrl);
            return StatusCode(503, new
            {
                success = false,
                message = "Layanan PaddleOCR Engine sedang tidak dapat dijangkau. Silakan periksa service di port 5055.",
                detail = ex.Message
            });
        }
    }
}
