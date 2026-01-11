using asp.net_service.Entities;

namespace asp.net_service.Persistance.IRepositories;

public interface ITokenRepository
{
    Task<IEnumerable<Token>> GetAllAsync();
    Task<Token?> GetBySymbolAsync(string symbol);
    Task<Token> AddAsync(Token token);
}
