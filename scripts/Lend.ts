import { ethers } from "hardhat";
import { IPool__factory, Token__factory } from "../typechain-types";

const POOL_ADDRESS = '0x7b5C526B7F8dfdff278b4a3e045083FBA4028790';
const DAI_ADDRESS = '0xBa8DCeD3512925e52FE67b1b5329187589072A55';
const USCD_ADDRESS = '0x65aFADD39029741B3b8f0756952C74678c9cEC93';
const IMPERSONATE_ADDRESS = '0xBA549d2730210AD373f9A29Ae918D3Bc7550C480';

async function main() {
    
    const impersonatedSigner = await ethers.getImpersonatedSigner(IMPERSONATE_ADDRESS);

    const poolContract = IPool__factory.connect(POOL_ADDRESS, impersonatedSigner);
    const USDCContract = Token__factory.connect(USCD_ADDRESS, impersonatedSigner);

    const approveTx = await USDCContract.approve(POOL_ADDRESS, ethers.utils.parseUnits('1', 6));
    approveTx.wait();
  
    const lendTx = await poolContract.supply(USCD_ADDRESS, ethers.utils.parseUnits('1', 6), impersonatedSigner.address, 0);
    lendTx.wait();

    let accountData = await poolContract.getUserAccountData(impersonatedSigner.address);
    console.log(`Total Available Borrow Base: ${accountData.availableBorrowsBase}`);

    const borrowTX = await poolContract.borrow(DAI_ADDRESS, ethers.utils.parseUnits('0.5', 18), 2, 0, impersonatedSigner.address);
    borrowTX.wait()

    accountData = await poolContract.getUserAccountData(impersonatedSigner.address);
    console.log(`Total Available Borrow Base: ${accountData.availableBorrowsBase}`);
}

main().catch((error)=> {
    console.log(error);
    process.exitCode = 1;
});