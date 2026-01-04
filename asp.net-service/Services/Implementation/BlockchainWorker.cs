namespace asp.net_service.Services.Implementation;

using asp.net_service.Persistance.IRepositories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Nethereum.ABI.FunctionEncoding.Attributes;
using Nethereum.Contracts;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Web3;
using System.Numerics;
using System.Threading;
using System.Threading.Tasks;


[Event("DepositETH")]
public class DepositEthEventDTO : IEventDTO
{
    [Parameter("address", "user", 1, true)]
    public string User { get; set; }

    [Parameter("uint256", "amount", 2, false)]
    public BigInteger Amount { get; set; }
}

public class BlockchainWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<BlockchainWorker> _logger;
    private readonly string _rpcUrl;
    private readonly string _contractAddress;
    private BigInteger _lastProcessedBlock = 0;

    public BlockchainWorker(IServiceScopeFactory scopeFactory, IConfiguration configuration, ILogger<BlockchainWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        _rpcUrl = configuration.GetValue<string>("Blockchain:RpcUrl")!;
        _contractAddress = configuration.GetValue<string>("Blockchain:ContractAddress")!;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var web3 = new Web3(_rpcUrl);

        var currentBlock = await web3.Eth.Blocks.GetBlockNumber.SendRequestAsync();
        _lastProcessedBlock = currentBlock.Value > 100 ? currentBlock.Value - 100 : 0;

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var latestBlock = await web3.Eth.Blocks.GetBlockNumber.SendRequestAsync();

                if (latestBlock.Value > _lastProcessedBlock)
                {
                    var filterInput = new NewFilterInput
                    {
                        FromBlock = new BlockParameter(new Nethereum.Hex.HexTypes.HexBigInteger(_lastProcessedBlock + 1)),
                        ToBlock = new BlockParameter(latestBlock),
                        Address = new[] { _contractAddress }
                    };

                    var logs = await web3.Eth.Filters.GetLogs.SendRequestAsync(filterInput);

                    var eventHandler = web3.Eth.GetEvent<DepositEthEventDTO>(_contractAddress);

                    foreach (var log in logs)
                    {
                        try
                        {
                            EventLog<DepositEthEventDTO> decoded = Event<DepositEthEventDTO>.DecodeEvent(log);
                            if (decoded?.Event != null)
                            {
                                await ProcessDepositAsync(decoded.Event.User, decoded.Event.Amount);
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error decoding log or processing deposit");
                        }
                    }

                    _lastProcessedBlock = latestBlock.Value;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Worker Error");
            }

            await Task.Delay(10000, stoppingToken);
        }
    }

    private async Task ProcessDepositAsync(string userAddress, BigInteger amountWei)
    {
        using var scope = _scopeFactory.CreateScope();
        var balanceRepo = scope.ServiceProvider.GetRequiredService<IBalanceRepository>();
        var userRepo = scope.ServiceProvider.GetRequiredService<IUserRepository>();

        var user = await userRepo.GetByAddressAsync(userAddress);
        if (user == null)
            user = await userRepo.CreateAsync(userAddress);

        decimal amountEth = (decimal)amountWei / 1_000_000_000_000_000_000m;

        await balanceRepo.DepositAsync(user.Id, "ETH", amountEth);

        _logger.LogInformation("[Worker] Deposited {Amount} ETH for {Address}", amountEth, userAddress);
    }
}
