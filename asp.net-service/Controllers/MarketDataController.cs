using asp.net_service.Persistance.IRepositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace asp.net_service.Controllers;

[Route("api/market/")]
[ApiController]
public class MarketDataController : ControllerBase
{
    private readonly ILogger<MarketDataController> _logger;
    private readonly IEthTickerRepository _ethTickerRepo;
    public MarketDataController(
        ILogger<MarketDataController> logger,
        IEthTickerRepository ethTickerRepo)
    {
        _logger = logger;
        _ethTickerRepo = ethTickerRepo;
    }
    [HttpGet("eth/getLatestUsdPrice")]
    public async Task<IActionResult> GetLastEthPrice()
    { 
        var latestTicker = await _ethTickerRepo.GetLatestTickerAsync();
        if (latestTicker == null)
        {
            return NotFound("No ticker data available.");
        }
        return Ok(new { price = latestTicker.Price, timestamp = latestTicker.TimeStamp });
    }
    [HttpGet("eth/getAvgPriceChange")]
    public async Task<IActionResult> GetAvgEthTickersPrice(TimeSpan time)
    {
        var avgPriceChange = await _ethTickerRepo.GetAverageTickerPriceChangePerTime(time);
        return Ok(new { averagePriceChange = avgPriceChange });
    }
}
