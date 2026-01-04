using asp.net_service.Entities;
using asp.net_service.Persistance.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace asp.net_service.Persistance.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;
    public UserRepository(AppDbContext context) => _context = context;

    public async Task<User?> GetByAddressAsync(string address) =>
        await _context.Users.Include(u => u.Balances)
            .FirstOrDefaultAsync(u => u.WalletAddress == address.ToLower());
    public async Task<User> CreateAsync(string address)
    {
        var user = new User { WalletAddress = address.ToLower() };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }
}
