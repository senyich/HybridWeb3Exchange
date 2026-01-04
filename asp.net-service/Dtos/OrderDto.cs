namespace asp.net_service.Dtos;

public class OrderDto
{
    public string Maker { get; set; }
    public string Side { get; set; }
    public string Amount { get; set; } 
    public string Price { get; set; }
    public string Nonce { get; set; }
    public string Signature { get; set; }
}