// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import { IPool } from "@aave/core-v3/contracts/interfaces/IPool.sol";
import { IAToken } from "@aave/core-v3/contracts/interfaces/IAToken.sol";
import { IERC20 } from "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract FlashLoanExit {

    IPool public POOL;

    constructor(address pool) {
        POOL = IPool(pool);
    }

    function repay(address token, address user, uint256 amount) public {
        POOL.repay(token, amount, 2, user);
    }

    function withdraw(address token, address user, uint256 amount) public {
        POOL.withdraw(token, amount, user);
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    )
        external
        returns (bool)
    {
        (address user, address aTokenAddress) = abi.decode(params, (address, address));
        IERC20 token = IERC20(asset);
        IAToken aToken = IAToken(aTokenAddress);

        token.approve(address(POOL), amount);
        repay(asset, user, amount);
        aToken.transferFrom(user, address(this), amount);
        withdraw(asset, address(this), amount + premium);

        uint amountOwed = amount + premium;
        token.approve(address(POOL), amountOwed);

        return true;
    }

    function exitFlashLoan(address user, address token, address aToken, uint256 amount) external {
        address receiverAddress = address(this);

        bytes memory params = abi.encode(user, aToken);
        uint16 referralCode = 0;

        POOL.flashLoanSimple(
            receiverAddress,
            token,
            amount,
            params,
            referralCode
        );
    }
}