import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { FlashLoanExit__factory, FlashLoanLeverage__factory } from "../typechain-types";
dotenv.config();

/*
*
* REMOVE/COMMENT OUT NETWORKS FROM hardhat.config.ts
*
*/

const POOL_ADDRESS = '0x7b5C526B7F8dfdff278b4a3e045083FBA4028790';

async function main() {
    // setup for wallet access of deployer
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey || privateKey.length <= 0) {
        throw new Error("No private key found");
    }

    // setup for provider access
    const alchemyApiKey = process.env.ALCHEMY_API_KEY;
    if (!alchemyApiKey || alchemyApiKey.length <= 0) {
        throw new Error("No Alchemy API key found");
    }

    const provider = new ethers.providers.AlchemyProvider("goerli", alchemyApiKey);
    const wallet = new ethers.Wallet(privateKey, provider);
    const signer = wallet.connect(provider);
    const balance = await signer.getBalance();
    console.log(`The account ${signer.address} has a balance of ${balance} wei`);

    console.log("Deploying the loan contract...");
    const flashLoanLeverageContractFactory = new FlashLoanLeverage__factory(signer);
    const flashLoanLeverageContract = await flashLoanLeverageContractFactory.deploy(POOL_ADDRESS);
    await flashLoanLeverageContract.deployed();

    console.log("Deploying the loan exit contract...");
    const flashLoanExitContractFactory = new FlashLoanExit__factory(signer);
    const flashLoanExitContract = await flashLoanExitContractFactory.deploy(POOL_ADDRESS);
    await flashLoanExitContract.deployed();

    console.log(`Leverage Contract: ${flashLoanLeverageContract.address}`);
    console.log(`Exit Contract: ${flashLoanExitContract.address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});