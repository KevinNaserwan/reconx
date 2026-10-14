using System.Security.Cryptography;
using System.Text;
using ReconX.Application.Interfaces;

namespace ReconX.Api.Middlewares;

public class IdempotencyMiddleware
{
    private readonly RequestDelegate _next;
    private const string IdempotencyHeader = "X-Idempotency-Key";

    public IdempotencyMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IIdempotencyService idempotencyService)
    {
        if (!HttpMethods.IsPost(context.Request.Method) && !HttpMethods.IsPut(context.Request.Method))
        {
            await _next(context);
            return;
        }

        if (!context.Request.Headers.TryGetValue(IdempotencyHeader, out var keyValues) || 
            string.IsNullOrWhiteSpace(keyValues.FirstOrDefault()))
        {
            // Idempotency key not provided, proceed normally
            await _next(context);
            return;
        }

        var key = keyValues.First()!.Trim();

        // Check if idempotency record exists
        var existing = await idempotencyService.GetRecordAsync(key, context.RequestAborted);
        if (existing != null)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = existing.ResponseCode;
            context.Response.Headers.Append("X-Cache-Lookup", "HIT-IDEMPOTENT");
            await context.Response.WriteAsync(existing.ResponseBody);
            return;
        }

        // Enable buffering to read request body hash
        context.Request.EnableBuffering();
        string requestHash;
        using (var reader = new StreamReader(context.Request.Body, Encoding.UTF8, leaveOpen: true))
        {
            var body = await reader.ReadToEndAsync();
            context.Request.Body.Position = 0;
            requestHash = ComputeSha256(body);
        }

        // Capture response
        var originalBodyStream = context.Response.Body;
        using var responseBody = new MemoryStream();
        context.Response.Body = responseBody;

        await _next(context);

        responseBody.Seek(0, SeekOrigin.Begin);
        var responseText = await new StreamReader(responseBody).ReadToEndAsync();
        responseBody.Seek(0, SeekOrigin.Begin);

        if (context.Response.StatusCode is >= 200 and < 300)
        {
            await idempotencyService.SaveRecordAsync(
                key, 
                context.Request.Path, 
                requestHash, 
                context.Response.StatusCode, 
                responseText, 
                TimeSpan.FromHours(24), 
                context.RequestAborted);
        }

        await responseBody.CopyToAsync(originalBodyStream);
    }

    private static string ComputeSha256(string raw)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(raw));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
