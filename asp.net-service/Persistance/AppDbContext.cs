using asp.net_service.Entities;
using Microsoft.EntityFrameworkCore;
namespace asp.net_service.Persistance;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<EthTicker> EthTickers { get; set; }
    public DbSet<Token> Tokens { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}
