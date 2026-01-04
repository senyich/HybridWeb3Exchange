using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using asp.net_service.Entities;
using asp.net_service.Persistance.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace asp.net_service.Persistance.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _context;
    public OrderRepository(AppDbContext context) => _context = context;

    public async Task AddAsync(Order order)
    {
        if (order.Id == Guid.Empty)
            order.Id = Guid.NewGuid();

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();
    }

    public async Task<List<Order>> GetActiveOrdersAsync()
    {
        return await _context.Orders
            .Include(o => o.User)
            .Where(o => o.Status == OrderStatus.Open || o.Status == OrderStatus.PartiallyFilled)
            .ToListAsync();
    }
}
