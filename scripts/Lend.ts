import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { IPool__factory } from "../typechain-types";

const POOL_ADDRESS = '0x6060Cf73C79098D32c9b936F4B26283427f1BFAd'

async function main() {
    let account1: SignerWithAddress;
    let account2: SignerWithAddress;
    let account3: SignerWithAddress;

    [account1, account2, account3] = await ethers.getSigners();

    const poolContract = IPool__factory.connect(POOL_ADDRESS, account1);
    
    const accountData = await poolContract.getUserAccountData(account1.address);
    
    console.log(`Total Collateral Base: ${accountData.totalCollateralBase}`);

}

main().catch((error)=> {
    console.log(error);
    process.exitCode = 1;
});