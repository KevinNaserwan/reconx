using Microsoft.EntityFrameworkCore;
using ReconX.Api.Middlewares;
using ReconX.Application.Interfaces;
using ReconX.Application.Services;
using ReconX.Infrastructure.Persistence;
using ReconX.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Controllers & Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "ReconX — Payment Clearing & Reconciliation Engine API",
        Version = "v1",
        Description = "Enterprise-grade financial clearing, multi-pass transaction matching, and discrepancy exception management platform."
    });
});

// CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .WithExposedHeaders("X-Cache-Lookup");
    });
});

// Database Setup: Use InMemory if configured or if PostgreSQL is unreachable
var useInMemory = builder.Configuration.GetValue<bool>("UseInMemory", true);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (!useInMemory && !string.IsNullOrWhiteSpace(connectionString))
    {
        options.UseNpgsql(connectionString);
    }
    else
    {
        options.UseInMemoryDatabase("ReconX_InMemory_Db");
    }
});

builder.Services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<AppDbContext>());

// Domain & Application Services
builder.Services.AddScoped<IReconciliationEngine, ReconciliationEngine>();
builder.Services.AddScoped<ICsvStreamParser, CsvStreamParser>();
builder.Services.AddScoped<IIdempotencyService, IdempotencyService>();

var app = builder.Build();

// Auto-seed initial demo dataset on startup
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.EnsureCreated();
    await DbInitializer.SeedAsync(context);
}

// HTTP Pipeline
app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseMiddleware<IdempotencyMiddleware>();

app.UseStaticFiles();
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "ReconX API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();
