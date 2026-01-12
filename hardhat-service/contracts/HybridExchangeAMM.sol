// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HybridExchangeAMM
 * @dev Поддерживает множество пар ETH <-> ERC20 в одном контракте.
 * Реализует паттерн Monolithic AMM.
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

    event PoolCreated(address indexed token);
    event LiquidityAdded(address indexed token, address indexed provider, uint256 ethAmount, uint256 tokenAmount, uint256 liquidityMinted);
    event LiquidityRemoved(address indexed token, address indexed provider, uint256 ethAmount, uint256 tokenAmount, uint256 liquidityBurned);
    event Swap(address indexed trader, address indexed token, string side, uint256 inputAmount, uint256 outputAmount);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Создание пула или добавление ликвидности в существующий.
     * @param tokenAddr Адрес ERC20 токена.
     * @param tokenAmount Кол-во токенов для добавления.
     * @return liquidityMinted Кол-во полученных LP долей.
     */
    function addLiquidity(address tokenAddr, uint256 tokenAmount) external payable nonReentrant returns (uint256 liquidityMinted) {
        require(tokenAddr != address(0), "Invalid token address");
        require(msg.value > 0, "Zero ETH sent");
        require(tokenAmount > 0, "Zero token amount");

        Pool storage pool = pools[tokenAddr];
        IERC20 token = IERC20(tokenAddr);

        if (!pool.isCreated) {
            pool.isCreated = true;
            allTokens.push(tokenAddr);
            emit PoolCreated(tokenAddr);
        }

        if (pool.totalLiquidity == 0) {
            token.safeTransferFrom(msg.sender, address(this), tokenAmount);
            liquidityMinted = msg.value;
            pool.totalLiquidity = liquidityMinted;
            liquidity[tokenAddr][msg.sender] = liquidityMinted;

            pool.ethReserve = msg.value;
            pool.tokenReserve = tokenAmount;

        } else {
            uint256 ethReserve = pool.ethReserve;
            uint256 tokenReserve = pool.tokenReserve;
            uint256 requiredToken = (msg.value * tokenReserve) / ethReserve;
            require(tokenAmount >= requiredToken, "Insufficient token amount provided for ratio");

            token.safeTransferFrom(msg.sender, address(this), requiredToken);

            liquidityMinted = (msg.value * pool.totalLiquidity) / ethReserve;
            liquidity[tokenAddr][msg.sender] += liquidityMinted;
            pool.totalLiquidity += liquidityMinted;

            pool.ethReserve += msg.value;
            pool.tokenReserve += requiredToken;

            if (tokenAmount > requiredToken) {
            }
        }

        emit LiquidityAdded(tokenAddr, msg.sender, msg.value, tokenAmount, liquidityMinted);
    }

    /**
     * @notice Удаление ликвидности и получение обратно ETH и Токенов.
     */
    function removeLiquidity(address tokenAddr, uint256 liquidityAmount) external nonReentrant returns (uint256 ethAmount, uint256 tokenAmount) {
        Pool storage pool = pools[tokenAddr];
        require(pool.totalLiquidity > 0, "Pool not exists");
        require(liquidity[tokenAddr][msg.sender] >= liquidityAmount, "Not enough liquidity shares");

        ethAmount = (liquidityAmount * pool.ethReserve) / pool.totalLiquidity;
        tokenAmount = (liquidityAmount * pool.tokenReserve) / pool.totalLiquidity;

        liquidity[tokenAddr][msg.sender] -= liquidityAmount;
        pool.totalLiquidity -= liquidityAmount;
        pool.ethReserve -= ethAmount;
        pool.tokenReserve -= tokenAmount;

        (bool success, ) = msg.sender.call{value: ethAmount}("");
        require(success, "ETH transfer failed");

        IERC20(tokenAddr).safeTransfer(msg.sender, tokenAmount);

        emit LiquidityRemoved(tokenAddr, msg.sender, ethAmount, tokenAmount, liquidityAmount);
    }

    /**
     * @notice Свап ETH -> Токен
     * @param tokenAddr Адрес токена, который хотим купить.
     * @param minTokensOut Минимальное кол-во токенов, которое мы согласны получить (защита от Front-running).
     */
    function swapExactETHForTokens(address tokenAddr, uint256 minTokensOut) external payable nonReentrant returns (uint256 tokensOut) {
        Pool storage pool = pools[tokenAddr];
        require(pool.isCreated, "Pool does not exist");
        require(msg.value > 0, "Zero ETH sent");
        uint256 ethReserve = pool.ethReserve;
        uint256 tokenReserve = pool.tokenReserve;
        require(ethReserve > 0 && tokenReserve > 0, "Insufficient liquidity");

        tokensOut = getAmountOut(msg.value, ethReserve, tokenReserve);
        require(tokensOut >= minTokensOut, "Slippage tolerance exceeded");

        pool.ethReserve += msg.value;
        pool.tokenReserve -= tokensOut;

        IERC20(tokenAddr).safeTransfer(msg.sender, tokensOut);

        emit Swap(msg.sender, tokenAddr, "ETH->Token", msg.value, tokensOut);
    }

    /**
     * @notice Свап Токен -> ETH
     * @param tokenAddr Адрес токена, который продаем.
     * @param tokenIn Количество токенов на продажу.
     * @param minEthOut Минимальное кол-во ETH на выходе.
     */
    function swapExactTokensForETH(address tokenAddr, uint256 tokenIn, uint256 minEthOut) external nonReentrant returns (uint256 ethOut) {
        Pool storage pool = pools[tokenAddr];
        require(pool.isCreated, "Pool does not exist");
        require(tokenIn > 0, "Zero tokens sent");

        uint256 ethReserve = pool.ethReserve;
        uint256 tokenReserve = pool.tokenReserve;
        require(ethReserve > 0 && tokenReserve > 0, "Insufficient liquidity");

        IERC20(tokenAddr).safeTransferFrom(msg.sender, address(this), tokenIn);

        ethOut = getAmountOut(tokenIn, tokenReserve, ethReserve);
        require(ethOut >= minEthOut, "Slippage tolerance exceeded");

        pool.tokenReserve += tokenIn;
        pool.ethReserve -= ethOut;

        (bool success, ) = msg.sender.call{value: ethOut}("");
        require(success, "ETH transfer failed");

        emit Swap(msg.sender, tokenAddr, "Token->ETH", tokenIn, ethOut);
    }

    /**
     * @dev Формула постоянного продукта (x * y = k) с комиссией 0.3%.
     */
    function getAmountOut(uint256 inputAmount, uint256 inputReserve, uint256 outputReserve) public pure returns (uint256) {
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