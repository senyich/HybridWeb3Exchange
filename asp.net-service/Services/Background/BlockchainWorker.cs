using Nethereum.ABI.FunctionEncoding.Attributes;
using Nethereum.Contracts;
using Nethereum.JsonRpc.WebSocketStreamingClient;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.RPC.Eth.Subscriptions;
using System.Numerics;

namespace asp.net_service.Services.Background;

[Event("Swap")]
public class SwapEventDTO : IEventDTO
{
    [Parameter("address", "trader", 1, true)]
    public string Trader { get; set; }

    [Parameter("address", "token", 2, true)]
    public string Token { get; set; }

    [Parameter("string", "side", 3, false)]
    public string Side { get; set; }

    [Parameter("uint256", "inputAmount", 4, false)]
    public BigInteger InputAmount { get; set; }

    [Parameter("uint256", "outputAmount", 5, false)]
    public BigInteger OutputAmount { get; set; }
}

[Event("LiquidityAdded")]
public class LiquidityAddedEventDTO : IEventDTO
{
    [Parameter("address", "token", 1, true)]
    public string Token { get; set; }

    [Parameter("address", "provider", 2, true)]
    public string Provider { get; set; }

    [Parameter("uint256", "ethAmount", 3, false)]
    public BigInteger EthAmount { get; set; }

    [Parameter("uint256", "tokenAmount", 4, false)]
    public BigInteger TokenAmount { get; set; }

    [Parameter("uint256", "liquidityMinted", 5, false)]
    public BigInteger LiquidityMinted { get; set; }
}
public class BlockchainWorker : BackgroundService
{
    private readonly string _wssRpcAddress;
    private readonly string _contractAddress;
    private readonly ILogger<BlockchainWorker> _logger;
    public BlockchainWorker(
        IConfiguration configuration,
        ILogger<BlockchainWorker> logger)
    {
        _logger = logger;
        _contractAddress = Nethereum.Util.AddressUtil.Current.ConvertToChecksumAddress(
            configuration.GetValue<string>("Blockchain:ContractAddress")
        ); _wssRpcAddress = configuration.GetValue<string>("Blockchain:RpcWebsocketsUrl")!;
    }
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var swapEvent = new SwapEventDTO();
        var liquidityEvent = new LiquidityAddedEventDTO();
        var logsFilterInput = new NewFilterInput
        {
            Address = new[] { _contractAddress },
            Topics = new[]
            {
                new object[]
                {
                    swapEvent.GetEventABI().Sha3Signature,
                    liquidityEvent.GetEventABI().Sha3Signature,
                }
            }
        };

        using var client = new StreamingWebSocketClient(_wssRpcAddress);
        var subscription = new EthLogsSubscription(client);

        subscription.SubscriptionDataResponse += (sender, e) =>
        {
            try
            {
                var log = e.Response;

                if (log.IsLogForEvent<SwapEventDTO>())
                {
                    var eventData = log.DecodeEvent<SwapEventDTO>();
                    _logger.LogInformation(
                        "[SWAP] {Side} | Trader: {Trader} | In: {In} | Out: {Out} | Token: {Token}",
                        eventData.Event.Side,
                        eventData.Event.Trader,
                        eventData.Event.InputAmount,
                        eventData.Event.OutputAmount,
                        eventData.Event.Token
                    );
                }
                else if (log.IsLogForEvent<LiquidityAddedEventDTO>())
                {
                    var eventData = log.DecodeEvent<LiquidityAddedEventDTO>();
                    _logger.LogInformation(
                        "[LIQUIDITY ADD] Provider: {Provider} | ETH: {Eth} | Token: {TokenAmt}",
                        eventData.Event.Provider,
                        eventData.Event.EthAmount,
                        eventData.Event.TokenAmount
                    );
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Log read error");
            }
        };

        client.Error += (sender, ex) =>
            _logger.LogError(ex, "WebSocket error");

        try
        {
            await client.StartAsync(); 
            _logger.LogInformation("WebSocket connected");

            await subscription.SubscribeAsync(logsFilterInput); 

            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(1000, stoppingToken);
            }
        }
        catch (OperationCanceledException)
        { }
        catch (Exception ex)
        {
            _logger.LogCritical(ex, "Критическая ошибка BlockchainWorker");
        }
        finally
        {
            if (client.WebSocketState == System.Net.WebSockets.WebSocketState.Open)
            {
                await subscription.UnsubscribeAsync();
            }
        }
    }

}
