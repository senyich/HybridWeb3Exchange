
const ExchangeBaseABI : string[] = [
    'event Deposit(address indexed user, uint256 amount)',
    'event Withdraw(address indexed user, uint256 amount)',
    'function getBalance(address user) view returns (uint256)',
  ];

export {
    ExchangeBaseABI
}