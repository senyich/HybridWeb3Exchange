using asp.net_service.Entities;
using asp.net_service.Persistance.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace asp.net_service.Persistance.Repositories;
public class BalanceRepository : IBalanceRepository
{
    private readonly AppDbContext _context;
    public BalanceRepository(AppDbContext context) => _context = context;
    public async Task<Balance?> GetBalanceAsync(int userId, string currency) =>
        await _context.Balances.FirstOrDefaultAsync(b => b.UserId == userId && b.Currency == currency);

    public async Task UpdateBalanceAsync(Balance balance)
    {
        _context.Balances.Update(balance);
        await _context.SaveChangesAsync();
    }

    public async Task DepositAsync(int userId, string currency, decimal amount)
    {
        var balance = await GetBalanceAsync(userId, currency);
        if (balance == null)
        {
            balance = new Balance
            {
                UserId = userId,
                Currency = currency,
                Available = amount,
                Locked = 0
            };
            _context.Balances.Add(balance);
        }
        else
        {
            balance.Available += amount;
            _context.Balances.Update(balance);
        }

        await _context.SaveChangesAsync();
    }
}