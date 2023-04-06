# AAVE Flash Loan Experiment

# Set up Environment
Contents of .env file
```
ALCHEMY_API_KEY=your-goerli-alchemy-key
```

Install dependencies and compile contract
```
yarn install
harn hardhat compile
```

# Run Lending Script
```
yarn run ts-node --files ./scripts/Lend.ts
```
This script creates a hardhat fork of the goerli testnet and uses a 
pre-funded account to loan 1 USDC to the AAVE pool in order to borrow 0.5 DAI

# Run Flash Loan Script
```
yarn run ts-node --files ./scripts/FlashLoan.ts
```
This script creates a hardhat fork of the goerli testnet and uses a 
pre-funded account to perform a flash loan using AAVE v3. 
The flash loan sets up a leveraged lending position by flash loaning
100 USDC, transferring 100 USDC from the user, and lending the total
200 USDC on the user's behalf. It then borrows 100 USDC on this collateral 
to pay off the flash loan.

After this leveraged position is entered, a separate series of transactions
is initiated to exit the leveraged position. A new flash loan is created to repay
the AAVE loan. To repay the flash loan, some aUSDC is transferred from the user
to the smart contract and withdrawn from the lending pool.