using asp.net_service.Entities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace asp.net_service.Entities;

public class Balance
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; }

    [Required]
    public string Currency { get; set; } 

    [Column(TypeName = "decimal(38, 18)")]
    public decimal Available { get; set; } = 0; 

    [Column(TypeName = "decimal(38, 18)")]
    public decimal Locked { get; set; } = 0;  
}