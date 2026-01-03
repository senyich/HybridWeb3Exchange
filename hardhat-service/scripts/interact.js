const hre = require("hardhat");

async function main() {
  const contractAddress = "0xC09931BC44bd206550423fCD77B5B9b403021cf0";
  
  const [signer] = await hre.ethers.getSigners();
  
  const MyContract = await hre.ethers.getContractFactory("ExchangeBase");
  const contract = await MyContract.attach(contractAddress);

  console.log("--- Отчет по контракту ---");

  console.log("Попытка депозита 0.01 ETH...");
  const tx = await contract.deposit({ value: hre.ethers.parseEther("0.01") });
  
  console.log("Транзакция отправлена:", tx.hash);
  await tx.wait(); 
  
  const newBalance = await contract.balances(signer.address);
  console.log("Новый баланс:", hre.ethers.formatEther(newBalance));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});