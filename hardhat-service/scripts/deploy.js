const hre = require("hardhat");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("🚀 Начало полного деплоя");
  console.log("Аккаунт:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Баланс ETH:", hre.ethers.formatEther(balance));

  console.log("Создаем токены...");
  const MyToken = await hre.ethers.getContractFactory("MyToken");

  const topCoin = await MyToken.deploy("TopCOIN", "TC", hre.ethers.parseUnits("1000000", 18));
  await topCoin.waitForDeployment();
  const tcAddress = await topCoin.getAddress();
  console.log(`   -> TopCOIN (TC): ${tcAddress}`);
  await sleep(2000); 

  const topGem = await MyToken.deploy("TopGEM", "TG", hre.ethers.parseUnits("1000000", 18));
  await topGem.waitForDeployment();
  const tgAddress = await topGem.getAddress();
  console.log(`   -> TopGEM (TG):  ${tgAddress}`);
  await sleep(2000); 

  const monkeyCoin = await MyToken.deploy("MonkeyCoin", "MC", hre.ethers.parseUnits("1000000", 18));
  await monkeyCoin.waitForDeployment();
  const mcAddress = await monkeyCoin.getAddress();
  console.log(`   -> MonkeyCoin (MC): ${mcAddress}`);
  await sleep(2000); 


  console.log("\nHybridExchangeAMM...");
  const Exchange = await hre.ethers.getContractFactory("HybridExchangeAMM");
  const exchange = await Exchange.deploy();
  await exchange.waitForDeployment();
  const exchangeAddress = await exchange.getAddress();
  console.log(`   -> Биржа готова: ${exchangeAddress}`);
  
  await sleep(5000); 


  console.log("\n3. Заливаем ликвидность с разными курсами...");

  console.log("\n=============================================");
  console.log("ДЕПЛОЙ И НАСТРОЙКА ЗАВЕРШЕНЫ УСПЕШНО!");
  console.log("=============================================");
  console.log("Exchange Contract:", exchangeAddress);
  console.log("---------------------------------------------");
  console.log("TopCOIN (TC):", tcAddress);
  console.log("TopGEM (TG):", tgAddress);
  console.log("MonkeyCoin (MC):", mcAddress);
  console.log("=============================================");
  console.log("Скопируй эти адреса в свой constants.ts на фронтенде!");
}

main().catch((error) => {
  console.error("\n!!! ОШИБКА ДЕПЛОЯ !!!");
  console.error(error);
  process.exitCode = 1;
});