import { ethers } from "hardhat";
import { FlashLoanExit__factory, FlashLoanLeverage__factory, ICreditDelegationToken__factory, IPool__factory, Token__factory } from "../typechain-types";

const POOL_ADDRESS = '0x7b5C526B7F8dfdff278b4a3e045083FBA4028790';
const USDC_ADDRESS = '0x65aFADD39029741B3b8f0756952C74678c9cEC93';
const AUSDC_ADDRESS = '0x8Be59D90A7Dc679C5cE5a7963cD1082dAB499918';
const USDC_VARIABLE_DEBT = '0x4DAe67e69aCed5ca8f99018246e6476F82eBF9ab';
const IMPERSONATE_ADDRESS = '0xBA549d2730210AD373f9A29Ae918D3Bc7550C480';
const FL_LEVERAGE_ADDRESS = '0x129Ca7ff8C681ee4640904e7fa1b09Bb584542Ac';
const FL_EXIT_CONTRACT = '0x5a4a5690b427DB7514D4588a0193D3f3f421BE43';
const LOAN_AMOUNT = ethers.utils.parseUnits('200', 6);
const BORROW_AMOUNT = ethers.utils.parseUnits('100', 6);

async function main() {
    
    const impersonatedSigner = await ethers.getImpersonatedSigner(IMPERSONATE_ADDRESS);
    const poolContract = IPool__factory.connect(POOL_ADDRESS, impersonatedSigner);
    const USDCContract = Token__factory.connect(USDC_ADDRESS, impersonatedSigner);
    const aUSDCContract = Token__factory.connect(AUSDC_ADDRESS, impersonatedSigner);
    const USDCDebtContract = ICreditDelegationToken__factory.connect(USDC_VARIABLE_DEBT, impersonatedSigner);
    const flashLoanLeverageContract = FlashLoanLeverage__factory.connect(FL_LEVERAGE_ADDRESS, impersonatedSigner);
    const flashLoanExitContract = FlashLoanExit__factory.connect(FL_EXIT_CONTRACT, impersonatedSigner);

    console.log("Pulling user account data...");
    let accountData = await poolContract.getUserAccountData(impersonatedSigner.address);
    console.log(`Total Collateral Base: ${accountData.totalCollateralBase}`);
    console.log(`Total Available Borrow Base: ${accountData.availableBorrowsBase}`);

    console.log("Approving the loan contract to withdraw USDC...");
    const approveLoanTx = await USDCContract.approve(flashLoanLeverageContract.address, LOAN_AMOUNT);
    approveLoanTx.wait();

    console.log("Approving debt delegation to allow loan contract to make borrow...")
    const debtTx = await USDCDebtContract.approveDelegation(flashLoanLeverageContract.address, BORROW_AMOUNT);
    await debtTx.wait();

    console.log("Attempting flash loan...");
    const flashTx = await flashLoanLeverageContract.flashLoanLeverage(impersonatedSigner.address, USDC_ADDRESS, LOAN_AMOUNT, BORROW_AMOUNT);
    flashTx.wait();
    console.log("Completed Flash Loan!");

    console.log("Pulling user account data...");
    accountData = await poolContract.getUserAccountData(impersonatedSigner.address);
    console.log(`Total Collateral Base: ${accountData.totalCollateralBase}`);
    console.log(`Total Available Borrow Base: ${accountData.availableBorrowsBase}`);

    let aUSCDBalance = await aUSDCContract.balanceOf(impersonatedSigner.address);
    console.log(`aUSDCBalance: ${aUSCDBalance}`);

    console.log("Approving the exit contract to withdraw aUSDC...");
    //need to approve more than loan amount to pay for AAVE flash loan fee
    const approveWithdrawTx = await aUSDCContract.approve(flashLoanExitContract.address, LOAN_AMOUNT);
    approveWithdrawTx.wait();

    console.log("Attempting flash exit...");
    const flashExitTx = await flashLoanExitContract.exitFlashLoan(impersonatedSigner.address, USDC_ADDRESS, AUSDC_ADDRESS, BORROW_AMOUNT);
    flashExitTx.wait();
    console.log("Completed Flash Exit!");

    console.log("Pulling user account data...");
    accountData = await poolContract.getUserAccountData(impersonatedSigner.address);
    console.log(`Total Collateral Base: ${accountData.totalCollateralBase}`);
    console.log(`Total Available Borrow Base: ${accountData.availableBorrowsBase}`);
}

main().catch((error)=> {
    console.log(error);
    process.exitCode = 1;
});