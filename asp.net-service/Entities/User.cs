using Org.BouncyCastle.Asn1.X509;
using System.ComponentModel.DataAnnotations;

namespace asp.net_service.Entities;

public class User
{
    public int Id { get; set; }

    [Required]
    public string WalletAddress { get; set; } 
    public int WithdrawalNonce { get; set; } = 0;

    public List<Balance> Balances { get; set; } = new();
    public List<Order> Orders { get; set; } = new();
}