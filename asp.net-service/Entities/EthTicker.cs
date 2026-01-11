namespace asp.net_service.Entities;

public class EthTicker
{
    public Guid Id { get; set; }
    public DateTime TimeStamp { get; set; }
    public decimal Price { get; set; }
}
