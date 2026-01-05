using asp.net_service.Persistance.IRepositories;
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

#region Event DTO

[Event("Deposit")]
public class DepositEthEventDTO : IEventDTO
{
    [Parameter("address", "user", 1, true)]
    public string User { get; set; } = default!;

    [Parameter("uint256", "amount", 2, false)]
    public BigInteger Amount { get; set; }
}

#endregion

public class BlockchainWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<BlockchainWorker> _logger;
    private readonly string _rpcUrl;
    private readonly string _contractAddress;

    private const int MaxBlockRange = 100;
    private BigInteger _lastProcessedBlock;

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
        var web3 = new Web3(_rpcUrl);

        var depositEvent = web3.Eth.GetEvent<DepositEthEventDTO>(_contractAddress);

        try
        {
            var currentBlock = await web3.Eth.Blocks.GetBlockNumber.SendRequestAsync();

            _lastProcessedBlock = 0;

            _logger.LogInformation(
                "BlockchainWorker started. Contract={Contract}, StartBlock={Block}",
                _contractAddress,
                _lastProcessedBlock);
        }
        catch (Exception ex)
        {
            _logger.LogCritical("RPC connection failed: {Error}", ex.Message);
            return;
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var latestBlock = (await web3.Eth.Blocks.GetBlockNumber.SendRequestAsync()).Value;

                if (_lastProcessedBlock >= latestBlock)
                {
                    await Task.Delay(5000, stoppingToken);
                    continue;
                }

                var fromBlock = _lastProcessedBlock + 1;
                var toBlock = BigInteger.Min(
                    _lastProcessedBlock + MaxBlockRange,
                    latestBlock);

                var filter = depositEvent.CreateFilterInput(
                    new BlockParameter(new HexBigInteger(fromBlock)),
                    new BlockParameter(new HexBigInteger(toBlock))
                );

                var logs = await web3.Eth.Filters.GetLogs.SendRequestAsync(filter);

                if (logs.Length > 0)
                {
                    var events = depositEvent.DecodeAllEventsForEvent(logs);

                    foreach (var e in events)
                    {
                        await ProcessDepositAsync(
                            e.Event.User,
                            e.Event.Amount,
                            e.Log.TransactionHash);
                    }
                }

                _lastProcessedBlock = toBlock;

                _logger.LogInformation(
                    "Processed blocks {From} → {To}",
                    fromBlock,
                    toBlock);
            }
            catch (Exception ex)
            {
                _logger.LogError("Worker error: {Error}", ex.Message);
                await Task.Delay(8000, stoppingToken);
            }

            await Task.Delay(2000, stoppingToken);
        }
    }

    private async Task ProcessDepositAsync(
        string userAddress,
        BigInteger amountWei,
        string txHash)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();

            var balanceRepo = scope.ServiceProvider.GetRequiredService<IBalanceRepository>();
            var userRepo = scope.ServiceProvider.GetRequiredService<IUserRepository>();

            var address = userAddress.ToLowerInvariant();

            var user = await userRepo.GetByAddressAsync(address)
                       ?? await userRepo.CreateAsync(address);

            var amountEth = Web3.Convert.FromWei(amountWei);

            await balanceRepo.DepositAsync(user.Id, "ETH", amountEth);

            _logger.LogInformation(
                "DEPOSIT: {Amount} ETH → {Address} | Tx {Tx}",
                amountEth,
                address,
                txHash);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                "ProcessDeposit failed. Tx={Tx}, Error={Error}",
                txHash,
                ex.Message);
        }
    }
}
