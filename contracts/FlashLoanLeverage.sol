// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import { IPool } from "@aave/core-v3/contracts/interfaces/IPool.sol";
import { IERC20 } from "@openzeppelin/contracts/interfaces/IERC20.sol";

contract FlashLoanLeverage {

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
        (address user, uint256 amountSupplied) = abi.decode(params, (address, uint256));
        IERC20 token = IERC20(asset);

        token.approve(address(POOL), amount + amountSupplied);
        token.transferFrom(user, address(this), amountSupplied);
        lend(asset, user, amount + amountSupplied);
        borrow(asset, user, amount + premium);

        uint amountOwed = amount + premium;
        token.approve(address(POOL), amountOwed);

        return true;
    }

    function flashLoanLeverage(address user, address token, uint256 totalToLend, uint256 amountSupplied) external {
        address receiverAddress = address(this);

        bytes memory params = abi.encode(user, amountSupplied);
        uint16 referralCode = 0;

        POOL.flashLoanSimple(
            receiverAddress,
            token,
            totalToLend - amountSupplied,
            params,
            referralCode
        );
    }
}