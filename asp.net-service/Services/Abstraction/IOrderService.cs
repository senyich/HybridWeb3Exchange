using asp.net_service.Dtos;

namespace asp.net_service.Services.Abstraction
{
    public interface IOrderService
    {
        Task<(bool Success, string Message)> PlaceOrderAsync(OrderDto dto);
    }
}