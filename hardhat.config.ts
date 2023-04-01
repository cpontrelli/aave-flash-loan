import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  paths: { tests: "tests" },
  solidity: "0.8.17",
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      }
    }
  }
};

export default config;
