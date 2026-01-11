using asp.net_service.Entities;
using asp.net_service.Persistance.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace asp.net_service.Persistance.Repositories;

public class TokenRepository : ITokenRepository
{
    private readonly AppDbContext _context;
    public TokenRepository(AppDbContext context)
    {
        _context = context;
    }
    public async Task<IEnumerable<Token>> GetAllAsync()
        => await _context.Tokens.ToListAsync();
    public async Task<Token?> GetBySymbolAsync(string symbol)
        => await _context.Tokens.FirstOrDefaultAsync(t => t.Symbol == symbol);
    public async Task<Token> AddAsync(Token token)
    {
        if (token.Id == Guid.Empty) token.Id = Guid.NewGuid();
        await _context.Set<Token>().AddAsync(token);
        await _context.SaveChangesAsync();
        return token;
    }
}
