using asp.net_service.Entities;

namespace asp.net_service.Persistance.IRepositories;

public interface IEthTickerRepository
{
    Task<EthTicker> GetLatestTickerAsync();
    Task<EthTicker> AddTickerAsync(EthTicker ticker);
    Task<decimal> GetAverageTickerPriceChangePerTime(TimeSpan time);
    Task CleanupOldTickersAsync();
}
