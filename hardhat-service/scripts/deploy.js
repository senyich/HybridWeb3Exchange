const hre = require("hardhat");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("🚀 Начало полного деплоя");
  console.log("Аккаунт:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Баланс ETH:", hre.ethers.formatEther(balance));

  console.log("\n📦 1. Деплоим токены...");
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


  console.log("\n🏦 2. Деплоим HybridExchangeAMM...");
  const Exchange = await hre.ethers.getContractFactory("HybridExchangeAMM");
  const exchange = await Exchange.deploy();
  await exchange.waitForDeployment();
  const exchangeAddress = await exchange.getAddress();
  console.log(`   -> Биржа готова: ${exchangeAddress}`);
  
  await sleep(5000); 


  console.log("\n💧 3. Заливаем ликвидность с разными курсами...");

  const ethAmountPerPool = hre.ethers.parseUnits("0.01", 18); 

  const setupPool = async (tokenContract, tokenSymbol, tokenAmountStr, description) => {
      console.log(`\n   [${tokenSymbol}] Настройка пула (${description})...`);
      
      const tokenAmount = hre.ethers.parseUnits(tokenAmountStr, 18);
      const tokenAddress = await tokenContract.getAddress();

      console.log(`     - Approve ${tokenAmountStr} ${tokenSymbol}...`);
      const txApprove = await tokenContract.approve(exchangeAddress, tokenAmount);
      await txApprove.wait();
      
      console.log(`     - Add Liquidity (0.01 ETH + ${tokenAmountStr} ${tokenSymbol})...`);
      const txAdd = await exchange.addLiquidity(tokenAddress, tokenAmount, {
          value: ethAmountPerPool
      });
      await txAdd.wait();
      console.log(`     ✅ Пул ${tokenSymbol} создан!`);
      await sleep(2000);
  };

  // Курс: За 1 ETH дадут 5,000,000 TC.
  await setupPool(topCoin, "TC", "50000", "Дешевый: много токенов");

  // Курс: За 1 ETH дадут всего 10,000 TG. Токен в 500 раз дороже TC.
  await setupPool(topGem, "TG", "100", "Дорогой: мало токенов");

  // Курс: За 1 ETH дадут 500,000 MC.
  await setupPool(monkeyCoin, "MC", "5000", "Средний: баланс");


  console.log("\n=============================================");
  console.log("🎉 ДЕПЛОЙ И НАСТРОЙКА ЗАВЕРШЕНЫ УСПЕШНО!");
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