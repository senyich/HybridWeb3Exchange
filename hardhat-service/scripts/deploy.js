const hre = require("hardhat");

async function main() {
  const BaseContract = await hre.ethers.getContractFactory("ExchangeBase");
  const contract = await BaseContract.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log(`Контракт успешно развернут по адресу: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});