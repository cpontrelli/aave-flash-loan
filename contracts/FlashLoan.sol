// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import { IPool } from "@aave/core-v3/contracts/interfaces/IPool.sol";
import { IERC20 } from "@openzeppelin/contracts/interfaces/IERC20.sol";

contract FlashLoan {

    IPool public POOL;

    constructor(address pool) {
        POOL = IPool(pool);
    }

    function lend(address token, address user, uint256 amount) public {
        POOL.supply(token, amount, user, 0);
    }

    function borrow(address token, address user, uint256 amount) public {
        POOL.borrow(token, amount, 2, 0, user);
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
        (address user, uint256 borrowAmount) = abi.decode(params, (address, uint256));
        IERC20 token = IERC20(asset);

        uint amountToLend = amount - premium;
        token.approve(address(POOL), amountToLend);
        lend(asset, user, amountToLend);
        borrow(asset, user, borrowAmount - premium);
        token.transferFrom(user, address(this), amountToLend);

        uint amountOwed = amount + premium;
        token.approve(address(POOL), amountOwed);

        return true;
    }

    function flashLoan(address user, address token, uint256 lendAmount, uint256 borrowAmount) external {
        address receiverAddress = address(this);

        bytes memory params = abi.encode(user, borrowAmount);
        uint16 referralCode = 0;

        POOL.flashLoanSimple(
            receiverAddress,
            token,
            lendAmount,
            params,
            referralCode
        );
    }
}