using System.Globalization;
using System.Text.Json;

using asp.net_service.Persistance.IRepositories;
using asp.net_service.Entities;

namespace asp.net_service.Services.Background;

public record EthUsdtPriceResponse
{
    public string symbol { get; set; }
    public string price { get; set; }
}

public class MarketHelperWorker : BackgroundService
{
    private readonly ILogger<MarketHelperWorker> _logger;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly string _rpcUrl;
    private readonly string _contractAddress;
    private readonly HttpClient _httpClient;
 
    public MarketHelperWorker(
        IServiceScopeFactory scopeFactory,
        IConfiguration configuration,
        ILogger<MarketHelperWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        _rpcUrl = configuration.GetValue<string>("Blockchain:RpcUrl")!;
        _contractAddress = configuration.GetValue<string>("Blockchain:ContractAddress")!;
        _httpClient = new HttpClient();
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var interval = TimeSpan.FromSeconds(10);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var price = await FetchEthUsdtPrice();
                var ticker = new EthTicker
                {
                    Id = Guid.NewGuid(),
                    TimeStamp = DateTime.UtcNow,
                    Price = price
                };

                using var scope = _scopeFactory.CreateScope();
                var repo = scope.ServiceProvider.GetRequiredService<IEthTickerRepository>();

                await repo.AddTickerAsync(ticker);

                _logger.LogInformation("Saved ETH ticker: {Price} at {Time}", price, ticker.TimeStamp);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while fetching or saving ETH ticker: {Message}", ex.Message);
            }
            try
            {
                await Task.Delay(interval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }
    }
    private async Task<decimal> FetchEthUsdtPrice()
    {
        var responseMessage = await _httpClient.GetAsync("https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT");
        responseMessage.EnsureSuccessStatusCode();

        var response = await responseMessage.Content.ReadFromJsonAsync<EthUsdtPriceResponse>()
            ?? throw new JsonException("Cannot read response");

        if (!decimal.TryParse(response.price, System.Globalization.NumberStyles.Number | System.Globalization.NumberStyles.AllowExponent, CultureInfo.InvariantCulture, out var price))
            throw new FormatException($"Invalid price format: '{response.price}'");

        return price;
    }

}
