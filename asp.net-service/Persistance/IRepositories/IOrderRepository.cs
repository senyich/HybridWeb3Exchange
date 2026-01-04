using asp.net_service.Entities;

namespace asp.net_service.Persistance.IRepositories;
public interface IOrderRepository
{
    Task AddAsync(Order order);
    Task<List<Order>> GetActiveOrdersAsync();
}