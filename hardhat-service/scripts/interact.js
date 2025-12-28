const hre = require("hardhat");

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  const [signer] = await hre.ethers.getSigners();
  
  const MyContract = await hre.ethers.getContractFactory("ExchangeBase");
  const contract = await MyContract.attach(contractAddress);

  console.log("--- Отчет по контракту ---");
  const rawBalance = await contract.balances(signer.address);
  console.log("Баланс (через mapping напрямую):", hre.ethers.formatEther(rawBalance));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});