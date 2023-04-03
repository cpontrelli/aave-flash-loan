import { ethers } from 'hardhat';

// Contract artifacts
import { MySimpleFlashLoanV3__factory } from "../typechain-types";

// Address of the deployed contract
const contractAddress = '0xf442ffe991456a03e99b17098a41a5b56bf9d820';

async function main() {
  // Get signer
  const [deployer] = await ethers.getSigners();

  // Get deployed contract
  const myContract = MySimpleFlashLoanV3__factory.connect(contractAddress, deployer);

  // Asset and amount to borrow
  const asset = '0x65aFADD39029741B3b8f0756952C74678c9cEC93'; // USDC on Goerli
  const amount = ethers.utils.parseEther('10000000');

  // Execute flash loan
  await myContract.executeFlashLoan(asset, amount);

  console.log('Flash loan executed!');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
