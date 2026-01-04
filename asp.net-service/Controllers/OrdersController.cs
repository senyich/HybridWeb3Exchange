using asp.net_service.Dtos;
using asp.net_service.Services.Abstraction;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Nethereum.ABI.EIP712;
using Nethereum.Signer;
using Nethereum.Signer.EIP712;
using System.Numerics;

namespace asp.net_service;

[Route("api/[controller]")]
[ApiController]
public class OrdersController : ControllerBase
{
    private readonly EthereumMessageSigner _signer = new EthereumMessageSigner();
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost("create-eip712")]
    public async Task<IActionResult> CreateOrderEip712([FromBody] OrderDto dto)
    {
        try
        {
            var typedData = new TypedData<Domain>
            {
                Domain = new Domain
                {
                    Name = "Diploma Exchange",
                    Version = "1",
                    ChainId = 11155111,
                    VerifyingContract = "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC" 
                },
                Types = new Dictionary<string, MemberDescription[]>
                {
                    ["EIP712Domain"] = new[]
                    {
                    new MemberDescription { Name = "name", Type = "string" },
                    new MemberDescription { Name = "version", Type = "string" },
                    new MemberDescription { Name = "chainId", Type = "uint256" },
                    new MemberDescription { Name = "verifyingContract", Type = "address" },
                },
                    ["Order"] = new[] 
                    {
                    new MemberDescription { Name = "maker", Type = "address" },
                    new MemberDescription { Name = "side", Type = "string" },
                    new MemberDescription { Name = "amount", Type = "uint256" },
                    new MemberDescription { Name = "price", Type = "uint256" },
                    new MemberDescription { Name = "nonce", Type = "uint256" },
                }
                },
                PrimaryType = "Order",
                Message = new[]
                {
                new MemberValue { TypeName = "address", Value = dto.Maker },
                new MemberValue { TypeName = "string", Value = dto.Side },
                new MemberValue { TypeName = "uint256", Value = BigInteger.Parse(dto.Amount) },
                new MemberValue { TypeName = "uint256", Value = BigInteger.Parse(dto.Price) },
                new MemberValue { TypeName = "uint256", Value = BigInteger.Parse(dto.Nonce) },
            }
            };

            var signer = new Eip712TypedDataSigner();
            var recoveredAddress = signer.RecoverFromSignatureV4(typedData, dto.Signature);

            if (!string.Equals(recoveredAddress, dto.Maker, StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("Signature Invalid! Recovered: " + recoveredAddress);
            }
            var (success, message) = await _orderService.PlaceOrderAsync(dto);
            if (!success) return BadRequest(message);

            return Ok(new { status = "Order placed", message });
        }
        catch (Exception ex)
        {
            return BadRequest($"Verification failed: {ex.Message}");
        }
    }
}
