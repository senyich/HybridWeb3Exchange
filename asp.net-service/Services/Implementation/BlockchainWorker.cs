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

    private HexBigInteger? _filterId;

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
            var latestBlock = (await web3.Eth.Blocks.GetBlockNumber.SendRequestAsync()).Value;

            var fromBlock = new HexBigInteger(
                latestBlock > 5 ? latestBlock - 5 : latestBlock);

            _filterId = await depositEvent.CreateFilterAsync<DepositEthEventDTO>(
                default(DepositEthEventDTO),
                new BlockParameter(fromBlock),
                BlockParameter.CreateLatest());

            _logger.LogInformation(
                "Deposit filter created. FromBlock={Block}, FilterId={FilterId}",
                fromBlock.Value,
                _filterId.Value);
        }
        catch (Exception ex)
        {
            _logger.LogCritical("Failed to create filter: {Error}", ex.Message);
            return;
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var changes = await depositEvent.GetFilterChangesAsync(_filterId);

                foreach (var e in changes)
                {
                    await ProcessDepositAsync(
                        e.Event.User,
                        e.Event.Amount,
                        e.Log.TransactionHash);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("Filter polling error: {Error}", ex.Message);

                await RecreateFilterAsync(web3, depositEvent);
            }

            await Task.Delay(3000, stoppingToken);
        }
    }

    private async Task RecreateFilterAsync(
        Web3 web3,
        Event<DepositEthEventDTO> depositEvent)
    {
        try
        {
            var latestBlock = (await web3.Eth.Blocks.GetBlockNumber.SendRequestAsync()).Value;

            var fromBlock = new HexBigInteger(
                latestBlock > 3 ? latestBlock - 3 : latestBlock);

            _filterId = await depositEvent.CreateFilterAsync<DepositEthEventDTO>(
                default(DepositEthEventDTO),
                new BlockParameter(fromBlock),
                BlockParameter.CreateLatest());

            _logger.LogWarning(
                "Deposit filter recreated. FromBlock={Block}, FilterId={FilterId}",
                fromBlock.Value,
                _filterId!.Value);
        }
        catch (Exception ex)
        {
            _logger.LogCritical("Filter recreation failed: {Error}", ex.Message);
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
