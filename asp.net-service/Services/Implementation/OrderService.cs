using System.Numerics;
using System.Globalization;
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
        if (string.IsNullOrWhiteSpace(dto.Amount) || string.IsNullOrWhiteSpace(dto.Price))
            return (false, "Amount and Price are required");

        if (!TryParseBigInteger(dto.Amount, out BigInteger amountWei) || !TryParseBigInteger(dto.Price, out BigInteger priceWei))
            return (false, "Invalid Amount or Price format");

        if (amountWei.Sign <= 0 || priceWei.Sign <= 0)
            return (false, "Amount and Price must be positive");

        decimal amount = (decimal)amountWei / 1_000_000_000_000_000_000m;
        decimal price = (decimal)priceWei / 1_000_000_000_000_000_000m;

        var user = await _userRepo.GetByAddressAsync(dto.Maker);
        if (user == null) return (false, "User not found. Please deposit funds first.");

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            string currencyToLock = dto.Side == "Buy" ? "USDT" : "ETH";
            decimal amountToLock = dto.Side == "Buy" ? (amount * price) : amount;

            var balance = await _balanceRepo.GetBalanceAsync(user.Id, currencyToLock);

            if (balance == null || balance.Available < amountToLock)
                return (false, $"Insufficient {currencyToLock} balance");

            balance.Available -= amountToLock;
            balance.Locked += amountToLock;

            var order = new Order
            {
                UserId = user.Id,
                Side = dto.Side == "Buy" ? OrderSide.Buy : OrderSide.Sell,
                Price = price,
                InitialAmount = amount,
                RemainingAmount = amount,
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

    private static bool TryParseBigInteger(string value, out BigInteger result)
    {
        result = BigInteger.Zero;
        if (string.IsNullOrWhiteSpace(value)) return false;

        value = value.Trim();
        try
        {
            if (value.StartsWith("0x") || value.StartsWith("0X"))
            {
                var hex = value.Substring(2);
                result = BigInteger.Parse(hex, NumberStyles.HexNumber, CultureInfo.InvariantCulture);
                return true;
            }

            if (BigInteger.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out result))
                return true;
        }
        catch
        {
        }
        return false;
    }
}
