using asp.net_service.Entities;
using asp.net_service.Persistance.IRepositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace asp.net_service.Controllers;

[Route("api/tokens/")]
[ApiController]
public class TokensController : ControllerBase
{
    private readonly ITokenRepository _tokenRepo;
    private readonly IConfiguration _configuration;
    private readonly ILogger<TokensController> _logger;
    public TokensController(ITokenRepository tokenRepo, IConfiguration configuration, ILogger<TokensController> logger)
    {
        _tokenRepo = tokenRepo;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpGet("get")]
    public async Task<IActionResult> GetAll()
    {
        var tokens = await _tokenRepo.GetAllAsync();
        return Ok(tokens);
    }

    [HttpGet("get/{symbol}")]
    public async Task<IActionResult> GetBySymbol(string symbol)
    {
        if (string.IsNullOrWhiteSpace(symbol)) return BadRequest("Symbol is required");

        var token = await _tokenRepo.GetBySymbolAsync(symbol);
        if (token == null) return NotFound();
        return Ok(token);
    }

    public record AddTokenRequest(string Name, string Symbol, string Address);

    [HttpPost("add")]
    public async Task<IActionResult> Add([FromBody] AddTokenRequest req)
    {
        if (!Request.Headers.TryGetValue("OWNER-PRIVATE-KEY", out var providedKey))
        {
            return Unauthorized("OWNER-PRIVATE-KEY header is required");
        }
        var configuredKey = _configuration.GetValue<string>("OwnerPrivateKey");
        if (string.IsNullOrEmpty(configuredKey))
        {
            _logger.LogWarning("OwnerPrivateKey is not configured in appsettings.json");
            return StatusCode(500, "Server not configured to accept token additions");
        }
        if (providedKey != configuredKey)
        {
            _logger.LogWarning("Invalid owner private key provided");
            return Unauthorized("Invalid owner private key");
        }
        if (req is null) return BadRequest("Request body is required");

        if (string.IsNullOrWhiteSpace(req.Name) || string.IsNullOrWhiteSpace(req.Symbol) || string.IsNullOrWhiteSpace(req.Address))
            return BadRequest("Name, Symbol and Address are required");

        var address = req.Address.Trim();
        if (!address.StartsWith("0x") || address.Length != 42)
            return BadRequest("Invalid Ethereum address format");

        var existing = await _tokenRepo.GetBySymbolAsync(req.Symbol);
        if (existing != null) return Conflict("Token with same symbol already exists");

        var token = new Token
        {
            Id = Guid.NewGuid(),
            Name = req.Name.Trim(),
            Symbol = req.Symbol.Trim(),
            Address = address
        };

        try
        {
            var added = await _tokenRepo.AddAsync(token);
            return CreatedAtAction(nameof(GetBySymbol), new { symbol = added.Symbol }, added);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to add token");
            return StatusCode(500, "Failed to add token");
        }
    }
}
