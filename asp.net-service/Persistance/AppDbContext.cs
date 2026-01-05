using asp.net_service.Entities;
using Microsoft.EntityFrameworkCore;
namespace asp.net_service.Persistance;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Balance> Balances { get; set; }
    public DbSet<Order> Orders { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.WalletAddress)
            .IsUnique();
        modelBuilder.Entity<Balance>()
            .HasIndex(b => new { b.UserId, b.Currency })
            .IsUnique();
    }
}
