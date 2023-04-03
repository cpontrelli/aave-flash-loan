import { ethers } from "ethers";
import { IPoolAddressesProvider__factory } from "../typechain-types";
import { MySimpleFlashLoanV3__factory } from "../typechain-types";
import { IFaucet__factory } from "../typechain-types";

async function main() {
    // Set up the provider and signer
    const provider = new ethers.providers.JsonRpcProvider();
    const signer = provider.getSigner();

    // Set up addresses and contracts
    const addressesProviderAddress = "0xC911B590248d127aD18546B186cC6B324e99F02c";
    const faucetAddress = "0xA70D8aD6d26931d0188c642A66de3B6202cDc5FA";
    const poolAddressProvider = IPoolAddressesProvider__factory.connect(
        addressesProviderAddress,
        signer
    );
    const faucet = IFaucet__factory.connect(faucetAddress, signer);

    // Deploy the contract
    const mySimpleFlashLoanV3Factory = new MySimpleFlashLoanV3__factory(signer);
    const mySimpleFlashLoanV3 = await mySimpleFlashLoanV3Factory.deploy(
        poolAddressProvider.address,
        faucet.address
    );
    await mySimpleFlashLoanV3.deployed();

    console.log("MySimpleFlashLoanV3 deployed to:", mySimpleFlashLoanV3.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
