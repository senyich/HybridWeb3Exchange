// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HybridExchangeAMM v2
 * @notice Оптимизированный монолитный AMM с защитой от inflation attack и поддержкой fee-on-transfer токенов.
 */
contract HybridExchangeAMM is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    struct Pool {
        uint256 ethReserve;
        uint256 tokenReserve;
        uint256 totalLiquidity;
        bool isCreated;
    }

    mapping(address => Pool) public pools;
    mapping(address => mapping(address => uint256)) public liquidity;
    address[] public allTokens;

    // Минимальная ликвидность для защиты от Inflation Attack (как в Uniswap V2)
    uint256 public constant MINIMUM_LIQUIDITY = 10**3;

    event PoolCreated(address indexed token);
    event LiquidityAdded(address indexed token, address indexed provider, uint256 ethAmount, uint256 tokenAmount, uint256 liquidityMinted);
    event LiquidityRemoved(address indexed token, address indexed provider, uint256 ethAmount, uint256 tokenAmount, uint256 liquidityBurned);
    event Swap(address indexed trader, address indexed token, string side, uint256 inputAmount, uint256 outputAmount);
    event Sync(address indexed token, uint256 ethReserve, uint256 tokenReserve);

    constructor() Ownable(msg.sender) {}

    modifier ensure(uint256 deadline) {
        require(block.timestamp <= deadline, "Transaction expired");
        _;
    }

    /**
     * @notice Добавление ликвидности.
     * @dev Теперь поддерживает fee-on-transfer токены и возвращает сдачу, если пропорция не соблюдена.
     */
    function addLiquidity(address tokenAddr, uint256 tokenAmountDesired, uint256 deadline) 
        external 
        payable 
        nonReentrant 
        ensure(deadline)
        returns (uint256 liquidityMinted) 
    {
        require(tokenAddr != address(0), "Invalid token address");
        require(msg.value > 0, "Zero ETH");
        
        Pool storage pool = pools[tokenAddr];
        
        // Кэшируем резервы в память для экономии газа
        uint256 _ethReserve = pool.ethReserve;
        uint256 _tokenReserve = pool.tokenReserve;

        if (!pool.isCreated) {
            pool.isCreated = true;
            allTokens.push(tokenAddr);
            emit PoolCreated(tokenAddr);
        }

        uint256 ethAdded = msg.value;
        uint256 tokenAdded;

        if (pool.totalLiquidity == 0) {
            // Инициализация пула
            tokenAdded = tokenAmountDesired;
            // Перевод токенов (поддержка fee-on-transfer)
            uint256 balanceBefore = IERC20(tokenAddr).balanceOf(address(this));
            IERC20(tokenAddr).safeTransferFrom(msg.sender, address(this), tokenAdded);
            uint256 balanceAfter = IERC20(tokenAddr).balanceOf(address(this));
            tokenAdded = balanceAfter - balanceBefore; // Реально полученное кол-во
            
            require(tokenAdded > 0, "Zero tokens received");

            // Защита от атаки первого депозита: сжигаем первые 1000 wei
            liquidityMinted = ethAdded - MINIMUM_LIQUIDITY;
            pool.totalLiquidity = ethAdded; // Total Supply включает сожженные
            // Начисляем Shares (LP) минус защита
            liquidity[tokenAddr][address(0)] = MINIMUM_LIQUIDITY; // Burn permanently
            liquidity[tokenAddr][msg.sender] = liquidityMinted;
        } else {
            // Расчет идеального количества токенов на основе текущего ETH
            uint256 tokenAmountOptimal = (ethAdded * _tokenReserve) / _ethReserve;
            require(tokenAmountDesired >= tokenAmountOptimal, "Insufficient token amount");

            // Мы берем только оптимальное кол-во токенов
            tokenAdded = tokenAmountOptimal;

            uint256 balanceBefore = IERC20(tokenAddr).balanceOf(address(this));
            IERC20(tokenAddr).safeTransferFrom(msg.sender, address(this), tokenAdded);
            uint256 balanceAfter = IERC20(tokenAddr).balanceOf(address(this));
            tokenAdded = balanceAfter - balanceBefore;

            // Расчет LP токенов (пропорционально ETH вкладу, так как ETH без комиссий)
            liquidityMinted = (ethAdded * pool.totalLiquidity) / _ethReserve;
            
            liquidity[tokenAddr][msg.sender] += liquidityMinted;
            pool.totalLiquidity += liquidityMinted;
        }

        // Обновляем резервы
        pool.ethReserve = _ethReserve + ethAdded;
        pool.tokenReserve = _tokenReserve + tokenAdded;

        emit LiquidityAdded(tokenAddr, msg.sender, ethAdded, tokenAdded, liquidityMinted);
    }

    function removeLiquidity(address tokenAddr, uint256 liquidityAmount, uint256 deadline) 
        external 
        nonReentrant 
        ensure(deadline)
        returns (uint256 ethAmount, uint256 tokenAmount) 
    {
        Pool storage pool = pools[tokenAddr];
        require(pool.totalLiquidity > 0, "Pool not exists");
        require(liquidity[tokenAddr][msg.sender] >= liquidityAmount, "Not enough shares");

        uint256 _totalLiquidity = pool.totalLiquidity; // Gas saving
        
        // Расчет доли
        ethAmount = (liquidityAmount * pool.ethReserve) / _totalLiquidity;
        tokenAmount = (liquidityAmount * pool.tokenReserve) / _totalLiquidity;

        require(ethAmount > 0 && tokenAmount > 0, "Amounts too small");

        // Обновление стейта
        liquidity[tokenAddr][msg.sender] -= liquidityAmount;
        pool.totalLiquidity -= liquidityAmount;
        
        // Обновление резервов перед трансфером (Checks-Effects-Interactions)
        pool.ethReserve -= ethAmount;
        pool.tokenReserve -= tokenAmount;

        // Трансферы
        (bool success, ) = msg.sender.call{value: ethAmount}("");
        require(success, "ETH transfer failed");
        
        IERC20(tokenAddr).safeTransfer(msg.sender, tokenAmount);

        emit LiquidityRemoved(tokenAddr, msg.sender, ethAmount, tokenAmount, liquidityAmount);
    }

    function swapExactETHForTokens(address tokenAddr, uint256 minTokensOut, uint256 deadline) 
        external 
        payable 
        nonReentrant 
        ensure(deadline)
        returns (uint256 tokensOut) 
    {
        Pool storage pool = pools[tokenAddr];
        require(pool.isCreated, "Pool not created");
        require(msg.value > 0, "Zero ETH");

        uint256 _ethReserve = pool.ethReserve;
        uint256 _tokenReserve = pool.tokenReserve;
        
        tokensOut = getAmountOut(msg.value, _ethReserve, _tokenReserve);
        require(tokensOut >= minTokensOut, "Slippage tolerance exceeded");

        // Обновляем резервы
        pool.ethReserve = _ethReserve + msg.value;
        pool.tokenReserve = _tokenReserve - tokensOut;

        IERC20(tokenAddr).safeTransfer(msg.sender, tokensOut);

        emit Swap(msg.sender, tokenAddr, "ETH->Token", msg.value, tokensOut);
    }

    function swapExactTokensForETH(address tokenAddr, uint256 tokenIn, uint256 minEthOut, uint256 deadline) 
        external 
        nonReentrant 
        ensure(deadline)
        returns (uint256 ethOut) 
    {
        Pool storage pool = pools[tokenAddr];
        require(pool.isCreated, "Pool not created");
        require(tokenIn > 0, "Zero tokens");

        // Поддержка fee-on-transfer для входящих свопов
        uint256 balanceBefore = IERC20(tokenAddr).balanceOf(address(this));
        IERC20(tokenAddr).safeTransferFrom(msg.sender, address(this), tokenIn);
        uint256 balanceAfter = IERC20(tokenAddr).balanceOf(address(this));
        uint256 amountReceived = balanceAfter - balanceBefore;

        uint256 _ethReserve = pool.ethReserve;
        uint256 _tokenReserve = pool.tokenReserve;

        ethOut = getAmountOut(amountReceived, _tokenReserve, _ethReserve);
        require(ethOut >= minEthOut, "Slippage tolerance exceeded");

        pool.tokenReserve = _tokenReserve + amountReceived;
        pool.ethReserve = _ethReserve - ethOut;

        (bool success, ) = msg.sender.call{value: ethOut}("");
        require(success, "ETH transfer failed");

        emit Swap(msg.sender, tokenAddr, "Token->ETH", amountReceived, ethOut);
    }

    /**
     * @notice Функция принудительной синхронизации резервов с реальным балансом
     * @dev Полезна, если кто-то отправил токены напрямую на контракт или для airdrop'ов.
     */
    function sync(address tokenAddr) external nonReentrant {
        Pool storage pool = pools[tokenAddr];
        require(pool.isCreated, "Pool not created");
        
        uint256 actualTokenBalance = IERC20(tokenAddr).balanceOf(address(this));
        // Для ETH мы не можем легко узнать "реальный" баланс только этого пула, 
        // так как ETH общий на контракте. В монолитном AMM sync обычно работает только для токенов,
        // либо требует сложной логики учета. В данной версии обновляем только Token reserve.
        
        // ВНИМАНИЕ: В монолитной архитектуре sync для ETH невозможен без отслеживания общего баланса ETH контракта.
        // Мы обновляем только токен.
        pool.tokenReserve = actualTokenBalance;
        
        emit Sync(tokenAddr, pool.ethReserve, actualTokenBalance);
    }

    /**
     * @dev Формула постоянного продукта (x * y = k) с комиссией 0.3%.
     */
    function getAmountOut(uint256 inputAmount, uint256 inputReserve, uint256 outputReserve) public pure returns (uint256) {
        require(inputReserve > 0 && outputReserve > 0, "Invalid reserves");
        uint256 inputAmountWithFee = inputAmount * 997;
        uint256 numerator = inputAmountWithFee * outputReserve;
        uint256 denominator = (inputReserve * 1000) + inputAmountWithFee;
        return numerator / denominator;
    }

    /**
     * @notice Получить резервы конкретного пула.
     */
    function getReserves(address tokenAddr) external view returns (uint256 ethReserve, uint256 tokenReserve) {
        Pool storage pool = pools[tokenAddr];
        return (pool.ethReserve, pool.tokenReserve);
    }

    /**
     * @notice Получить количество всех пулов.
     */
    function getTokensCount() external view returns (uint256) {
        return allTokens.length;
    }
}