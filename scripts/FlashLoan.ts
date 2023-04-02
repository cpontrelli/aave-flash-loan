import { ethers } from "hardhat";
import { FlashLoan__factory, ICreditDelegationToken__factory, IPool__factory, Token__factory } from "../typechain-types";

const POOL_ADDRESS = '0x7b5C526B7F8dfdff278b4a3e045083FBA4028790';
const USCD_ADDRESS = '0x65aFADD39029741B3b8f0756952C74678c9cEC93';
const USDC_VARIABLE_DEBT = '0x4DAe67e69aCed5ca8f99018246e6476F82eBF9ab';
const IMPERSONATE_ADDRESS = '0xBA549d2730210AD373f9A29Ae918D3Bc7550C480';
const LOAN_AMOUNT = ethers.utils.parseUnits('200', 6);
const BORROW_AMOUNT = ethers.utils.parseUnits('100', 6);

async function main() {
    
    const impersonatedSigner = await ethers.getImpersonatedSigner(IMPERSONATE_ADDRESS);

    const poolContract = IPool__factory.connect(POOL_ADDRESS, impersonatedSigner);
    const USDCContract = Token__factory.connect(USCD_ADDRESS, impersonatedSigner);
    const USDCDebtContract = ICreditDelegationToken__factory.connect(USDC_VARIABLE_DEBT, impersonatedSigner);
    
    console.log("Deploying the loan contract...");
    const flashLoanContractFactory = new FlashLoan__factory(impersonatedSigner);
    const flashLoanContract = await flashLoanContractFactory.deploy(POOL_ADDRESS);
    await flashLoanContract.deployed();

    console.log("Approving the loan contract...");
    const approveLoanTx = await USDCContract.approve(flashLoanContract.address, LOAN_AMOUNT);
    approveLoanTx.wait();

    console.log("Approving debt delegation...")
    const debtTx = await USDCDebtContract.approveDelegation(flashLoanContract.address, BORROW_AMOUNT);
    await debtTx.wait();

    console.log("Attempting flash loan...");
    const flashTx = await flashLoanContract.flashLoan(impersonatedSigner.address, USCD_ADDRESS, LOAN_AMOUNT, BORROW_AMOUNT);
    flashTx.wait();

    console.log("Completed Flash Loan!");
    const accountData = await poolContract.getUserAccountData(impersonatedSigner.address);
    console.log(`Total Collateral Base: ${accountData.totalCollateralBase}`);
    console.log(`Total Available Borrow Base: ${accountData.availableBorrowsBase}`);
}

main().catch((error)=> {
    console.log(error);
    process.exitCode = 1;
});