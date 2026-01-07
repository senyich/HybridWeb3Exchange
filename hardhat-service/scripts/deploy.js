const hre = require("hardhat");

async function main() {
  console.log("1. Деплоим токен (MyToken)...");
  const MyToken = await hre.ethers.getContractFactory("MyToken");
  const token = await MyToken.deploy(
    "TopCOIN",
    "TC",
    hre.ethers.parseUnits("1000000", 18)
  );
  await token.waitForDeployment();
  const tokenAddr = await token.getAddress();
  console.log(`✅ Token deployed: ${tokenAddr}`);

  console.log("2. Деплоим ExchangeBase с адресом токена...");
  const BaseContract = await hre.ethers.getContractFactory("ExchangeBase");
  const contract = await BaseContract.deploy(tokenAddr);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`✅ ExchangeBase deployed: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
