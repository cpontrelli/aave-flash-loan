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
The flash loan sets up a leveraged lending position by loaning 200 USDC,
lending the USDC on the user's behalf, and borrowing 100 USDC on the user's 
behalf to pay off half of the loan. 100 USDC must be supplied
by the user to repay the flash loan.