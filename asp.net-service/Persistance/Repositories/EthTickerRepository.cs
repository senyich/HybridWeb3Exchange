using asp.net_service.Entities;
using asp.net_service.Persistance.IRepositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace asp.net_service.Persistance.Repositories;

public class EthTickerRepository : IEthTickerRepository
{
    private readonly AppDbContext _context;
    public EthTickerRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<EthTicker> AddTickerAsync(EthTicker ticker)
    {
        if (ticker == null) throw new ArgumentNullException(nameof(ticker));

        if (ticker.Id == Guid.Empty) ticker.Id = Guid.NewGuid();
        if (ticker.TimeStamp == default) ticker.TimeStamp = DateTime.UtcNow;

        await _context.EthTickers.AddAsync(ticker);
        
        await _context.SaveChangesAsync();
        return ticker;
    }

    public async Task<decimal> GetAverageTickerPriceChangePerTime(TimeSpan time)
    {
        var since = DateTime.UtcNow - time;

        var ticks = await _context.EthTickers
            .Where(t => t.TimeStamp >= since)
            .OrderBy(t => t.TimeStamp)
            .ToListAsync();

        if (ticks == null || ticks.Count < 2) return 0m;

        decimal totalChange = 0m;
        for (int i = 1; i < ticks.Count; i++)
        {
            totalChange += Math.Abs(ticks[i].Price - ticks[i - 1].Price);
        }

        return totalChange / (ticks.Count - 1);
    }
    public async Task<EthTicker> GetLatestTickerAsync()
    {
        var latest = await _context.EthTickers
            .OrderByDescending(t => t.TimeStamp)
            .FirstOrDefaultAsync();

        return latest!;
    }
    public async Task CleanupOldTickersAsync()
    {
        var totalCount = await _context.EthTickers.CountAsync();

        if (totalCount > 100)
        {
            var recordsToDelete = await _context.EthTickers
                .OrderBy(t => t.TimeStamp) 
                .Take(totalCount - 100)   
                .ToListAsync();

            _context.EthTickers.RemoveRange(recordsToDelete);
            await _context.SaveChangesAsync();
        }
    }
}
