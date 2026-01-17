using asp.net_service.Persistance;
using asp.net_service.Persistance.IRepositories;
using asp.net_service.Persistance.Repositories;
using asp.net_service.Services.Background;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Postgres")));

builder.Services.AddScoped<IEthTickerRepository, EthTickerRepository>();
builder.Services.AddScoped<ITokenRepository, TokenRepository>();

builder.Services.AddHostedService<MarketHelperWorker>();
builder.Services.AddHostedService<BlockchainWorker>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        builder =>
        {
            builder.WithOrigins("http://localhost") 
                   .AllowAnyHeader()
                   .AllowAnyMethod();
        });
});


var app = builder.Build();

app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.Migrate();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Ошибка при применении миграций.");
    }
}

app.Run();
