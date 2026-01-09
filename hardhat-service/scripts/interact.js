const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("🛠 Настройка ликвидности для существующих контрактов");
  console.log("Аккаунт:", deployer.address);

  const EXCHANGE_ADDR = "0xf9C7E28281e302912e3728241fb3eB77d8Fcb9c4";
  const TC_ADDR = "0x8EdDd55579F72E99fCbe2fc9747edd46B1f032AC";
  const TG_ADDR = "0x9c5956607797FdC78216FfDc4d608953eED655ad";
  const MC_ADDR = "0x3b2a9049685AACb584789C630d8c3d1d15D77AbD";

  const Exchange = await hre.ethers.getContractAt("HybridExchangeAMM", EXCHANGE_ADDR);
  const TopCoin = await hre.ethers.getContractAt("MyToken", TC_ADDR);
  const TopGem = await hre.ethers.getContractAt("MyToken", TG_ADDR);
  const MonkeyCoin = await hre.ethers.getContractAt("MyToken", MC_ADDR);

  const ethAmountPerPool = hre.ethers.parseUnits("0.01", 18);

  const addLiquidityToPool = async (tokenContract, symbol, amountStr) => {
    console.log(`\n🔹 Работаем с ${symbol}...`);
    const tokenAmount = hre.ethers.parseUnits(amountStr, 18);
    const tokenAddr = await tokenContract.getAddress();

    const allowance = await tokenContract.allowance(deployer.address, EXCHANGE_ADDR);
    if (allowance < tokenAmount) {
      console.log(`  - Апрув ${symbol}...`);
      const txApprove = await tokenContract.approve(EXCHANGE_ADDR, tokenAmount);
      await txApprove.wait();
      console.log(`  ✅ Апрув подтвержден`);
    } else {
      console.log(`  - ${symbol} уже имеет апрув`);
    }

    console.log(`  - Добавление ликвидности в пул ${symbol}...`);
    const txAdd = await Exchange.addLiquidity(tokenAddr, tokenAmount, {
      value: ethAmountPerPool
    });
    await txAdd.wait();
    console.log(`  ✅ Пул ${symbol} готов!`);
  };

  try {
    await addLiquidityToPool(TopCoin, "TC", "50000");   // Дешевый
    await addLiquidityToPool(TopGem, "TG", "100");     // Дорогой
    await addLiquidityToPool(MonkeyCoin, "MC", "5000"); // Средний

    console.log("\n🚀 ВСЕ ПУЛЫ УСПЕШНО НАПОЛНЕНЫ!");
  } catch (error) {
    console.error("\n❌ Ошибка при взаимодействии:");
    console.error(error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});