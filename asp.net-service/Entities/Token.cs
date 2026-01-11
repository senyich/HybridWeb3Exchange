namespace asp.net_service.Entities;

public class Token
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string Symbol { get; set; } = default!;
    public string Address { get; set; } = default!; 
}
