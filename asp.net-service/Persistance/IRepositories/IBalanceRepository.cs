using asp.net_service.Entities;

namespace asp.net_service.Persistance.IRepositories;
public interface IBalanceRepository
{
    Task<Balance?> GetBalanceAsync(int userId, string currency);
    Task UpdateBalanceAsync(Balance balance);

    Task DepositAsync(int userId, string currency, decimal amount);
}