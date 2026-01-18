using System.Reflection.PortableExecutable;
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
        modelBuilder.Entity<Token>().HasData(
            new Token
            {
                Id = Guid.NewGuid(),
                Name = "TopCOIN",
                Symbol = "TC",
                Address = "0x8EdDd55579F72E99fCbe2fc9747edd46B1f032AC"
            },
            new Token
            {
                Id = Guid.NewGuid(),
                Name = "TopGEM",
                Symbol = "TG",
                Address = "0x9c5956607797FdC78216FfDc4d608953eED655ad"
            },
            new Token
            {
                Id = Guid.NewGuid(),
                Name = "MonkeyCoin",
                Symbol = "MC",
                Address = "0x3b2a9049685AACb584789C630d8c3d1d15D77AbD"
            }
        );
    }
}
