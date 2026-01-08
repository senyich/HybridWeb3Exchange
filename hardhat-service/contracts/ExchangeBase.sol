// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ExchangeBase
 * @dev Minimal AMM to swap ETH <-> ERC20 token (constant product) with 0.3% fee.
 * Uses SafeERC20 and protects against reentrancy.
 */
contract ExchangeBase is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;

    uint256 public reserveETH;
    uint256 public reserveToken;

    uint256 public totalLiquidity;
    mapping(address => uint256) public liquidity;

    event LiquidityAdded(address indexed provider, uint256 ethAmount, uint256 tokenAmount, uint256 liquidityMinted);
    event LiquidityRemoved(address indexed provider, uint256 ethAmount, uint256 tokenAmount, uint256 liquidityBurned);
    event Swap(address indexed trader, address indexed inputToken, uint256 inputAmount, address indexed outputToken, uint256 outputAmount);

    constructor(address _token) {
        require(_token != address(0), "token zero address");
        token = IERC20(_token);
        reserveETH = address(this).balance;
        reserveToken = token.balanceOf(address(this));
    }

    /**
     * @notice Add liquidity to the pool. Approve token beforehand.
     * @param tokenAmount Amount of token user is providing (for initial liquidity this can be any positive value).
     * @return liquidityMinted Amount of liquidity units minted to the provider.
     */
    function addLiquidity(uint256 tokenAmount) external payable nonReentrant returns (uint256 liquidityMinted) {
        require(msg.value > 0, "zero ETH");
        require(tokenAmount > 0, "zero token");

        if (totalLiquidity == 0) {
            token.safeTransferFrom(msg.sender, address(this), tokenAmount);
            liquidityMinted = msg.value;
            liquidity[msg.sender] = liquidityMinted;
            totalLiquidity = liquidityMinted;
        } else {
            uint256 ethReserve = reserveETH;
            uint256 tokenReserve = reserveToken;
            require(ethReserve > 0 && tokenReserve > 0, "invalid reserves");

            uint256 requiredToken = (msg.value * tokenReserve) / ethReserve;
            require(tokenAmount >= requiredToken, "insufficient token amount");

            token.safeTransferFrom(msg.sender, address(this), requiredToken);

            liquidityMinted = (msg.value * totalLiquidity) / ethReserve;
            liquidity[msg.sender] += liquidityMinted;
            totalLiquidity += liquidityMinted;

            if (tokenAmount > requiredToken) {
                uint256 refund = tokenAmount - requiredToken;
                token.safeTransfer(msg.sender, refund);
            }
        }

        reserveETH = address(this).balance;
        reserveToken = token.balanceOf(address(this));

        emit LiquidityAdded(msg.sender, msg.value, tokenAmount, liquidityMinted);
    }

    /**
     * @notice Remove liquidity from the pool.
     * @param liquidityAmount Amount of liquidity units to burn.
     * @return ethAmount ETH returned to provider.
     * @return tokenAmount Token returned to provider.
     */
    function removeLiquidity(uint256 liquidityAmount) external nonReentrant returns (uint256 ethAmount, uint256 tokenAmount) {
        require(liquidityAmount > 0, "zero liquidity");
        require(liquidity[msg.sender] >= liquidityAmount, "not enough liquidity");
        require(totalLiquidity > 0, "no liquidity");

        ethAmount = (liquidityAmount * reserveETH) / totalLiquidity;
        tokenAmount = (liquidityAmount * reserveToken) / totalLiquidity;

        liquidity[msg.sender] -= liquidityAmount;
        totalLiquidity -= liquidityAmount;

        reserveETH = reserveETH - ethAmount;
        reserveToken = reserveToken - tokenAmount;

        (bool success, ) = msg.sender.call{value: ethAmount}("");
        require(success, "ETH transfer failed");

        token.safeTransfer(msg.sender, tokenAmount);

        emit LiquidityRemoved(msg.sender, ethAmount, tokenAmount, liquidityAmount);
    }

    /**
     * @notice Swap exact ETH for tokens. Returns amount of tokens received.
     */
    function swapExactETHForTokens() external payable nonReentrant returns (uint256 tokensOut) {
        require(msg.value > 0, "zero ETH");
        require(reserveETH > 0 && reserveToken > 0, "insufficient liquidity");

        tokensOut = getAmountOut(msg.value, reserveETH, reserveToken);
        require(tokensOut > 0, "zero output");

        reserveETH = address(this).balance;
        token.safeTransfer(msg.sender, tokensOut);
        reserveToken = token.balanceOf(address(this));

        emit Swap(msg.sender, address(0), msg.value, address(token), tokensOut);
    }

    /**
     * @notice Swap exact tokens for ETH. Approve token beforehand.
     * @param tokenIn Amount of token provided.
     * @return ethOut Amount of ETH sent to trader.
     */
    function swapExactTokensForETH(uint256 tokenIn) external nonReentrant returns (uint256 ethOut) {
        require(tokenIn > 0, "zero token");
        require(reserveETH > 0 && reserveToken > 0, "insufficient liquidity");

        token.safeTransferFrom(msg.sender, address(this), tokenIn);

        ethOut = getAmountOut(tokenIn, reserveToken, reserveETH);
        require(ethOut > 0, "zero output");

        reserveToken = token.balanceOf(address(this));
        reserveETH = address(this).balance;

        (bool success, ) = msg.sender.call{value: ethOut}("");
        require(success, "ETH transfer failed");

        reserveETH = address(this).balance;
        reserveToken = token.balanceOf(address(this));

        emit Swap(msg.sender, address(token), tokenIn, address(0), ethOut);
    }

    /**
     * @dev Price formula with fee. Fee is 0.3% (uses 997/1000 factor).
     */
    function getAmountOut(uint256 inputAmount, uint256 inputReserve, uint256 outputReserve) public pure returns (uint256) {
        require(inputReserve > 0 && outputReserve > 0, "invalid reserves");
        uint256 inputAmountWithFee = inputAmount * 997;
        uint256 numerator = inputAmountWithFee * outputReserve;
        uint256 denominator = (inputReserve * 1000) + inputAmountWithFee;
        return numerator / denominator;
    }

    /**
     * @notice Returns current reserves (ETH and token) held by the contract.
     */
    function getReserves() external view returns (uint256 ethReserve, uint256 tokenReserve) {
        ethReserve = address(this).balance;
        tokenReserve = token.balanceOf(address(this));
    }

    receive() external payable {}
}