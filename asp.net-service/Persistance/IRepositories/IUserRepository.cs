using asp.net_service.Entities;

namespace asp.net_service.Persistance.IRepositories;

public interface IUserRepository
{
    Task<User?> GetByAddressAsync(string address);
    Task<User> CreateAsync(string address);
}
