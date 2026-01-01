const hre = require("hardhat");

async function main() {
  console.log("1. Получаем фабрику контракта...");
  const BaseContract = await hre.ethers.getContractFactory("ExchangeBase");

  console.log("2. Отправляем транзакцию на деплой...");
  const contract = await BaseContract.deploy();

  console.log("3. Ждем подтверждения в блоке...");
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`✅ Контракт развернут: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});