using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Nethereum.ABI.FunctionEncoding.Attributes;
using Nethereum.Contracts;
using Nethereum.Hex.HexTypes;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Web3;
using System;
using System.Collections.Generic;
using System.Numerics;
using System.Threading;
using System.Threading.Tasks;

namespace asp.net_service.Services.Implementation;


public class BlockchainWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<BlockchainWorker> _logger;
    private readonly string _rpcUrl;
    private readonly string _contractAddress;

 
    public BlockchainWorker(
        IServiceScopeFactory scopeFactory,
        IConfiguration configuration,
        ILogger<BlockchainWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        _rpcUrl = configuration.GetValue<string>("Blockchain:RpcUrl")!;
        _contractAddress = configuration.GetValue<string>("Blockchain:ContractAddress")!;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
     
    }

}
