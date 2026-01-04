using System.ComponentModel.DataAnnotations.Schema;

namespace asp.net_service.Entities;

public enum OrderSide { Buy, Sell }
public enum OrderStatus { Open, Filled, Cancelled, PartiallyFilled }

public class Order
{
    public Guid Id { get; set; } 
    public int UserId { get; set; }
    public User User { get; set; }
    public OrderSide Side { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Open;

    [Column(TypeName = "decimal(38, 18)")]
    public decimal Price { get; set; }

    [Column(TypeName = "decimal(38, 18)")]
    public decimal InitialAmount { get; set; } 

    [Column(TypeName = "decimal(38, 18)")]
    public decimal RemainingAmount { get; set; } 
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string Signature { get; set; }
}