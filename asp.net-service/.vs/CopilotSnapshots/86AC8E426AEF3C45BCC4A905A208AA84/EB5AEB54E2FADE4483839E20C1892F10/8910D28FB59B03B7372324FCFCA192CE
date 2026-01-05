using asp.net_service.Dtos;
using asp.net_service.Entities;
using asp.net_service.Persistance;
using asp.net_service.Persistance.IRepositories;
using asp.net_service.Services.Abstraction;

namespace asp.net_service.Services.Implementation;

public class OrderService : IOrderService
{
    private readonly IUserRepository _userRepo;
    private readonly IBalanceRepository _balanceRepo;
    private readonly IOrderRepository _orderRepo;
    private readonly AppDbContext _context;

    public OrderService(IUserRepository userRepo, IBalanceRepository balanceRepo,
                        IOrderRepository orderRepo, AppDbContext context)
    {
        _userRepo = userRepo;
        _balanceRepo = balanceRepo;
        _orderRepo = orderRepo;
        _context = context;
    }

    public async Task<(bool Success, string Message)> PlaceOrderAsync(OrderDto dto)
    {
        if (dto.Amount <= 0 || dto.Price <= 0)
            return (false, "Amount and Price must be positive");

        var user = await _userRepo.GetByAddressAsync(dto.Maker);
        if (user == null) return (false, "User not found. Please deposit funds first.");

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            string currencyToLock = dto.Side == "Buy" ? "USDT" : "ETH";
            decimal amountToLock = dto.Side == "Buy" ? (dto.Amount * dto.Price) : dto.Amount;

            var balance = await _balanceRepo.GetBalanceAsync(user.Id, currencyToLock);

            if (balance == null || balance.Available < amountToLock)
                return (false, $"Insufficient {currencyToLock} balance");

            balance.Available -= amountToLock;
            balance.Locked += amountToLock;

            var order = new Order
            {
                UserId = user.Id,
                Side = dto.Side == "Buy" ? OrderSide.Buy : OrderSide.Sell,
                Price = dto.Price,
                InitialAmount = dto.Amount,
                RemainingAmount = dto.Amount,
                Signature = dto.Signature
            };

            await _orderRepo.AddAsync(order);
            await transaction.CommitAsync();

            return (true, "Order placed successfully");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return (false, $"Internal error: {ex.Message}");
        }
    }
}
