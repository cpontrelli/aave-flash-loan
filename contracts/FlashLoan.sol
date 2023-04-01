// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import { IPool } from "@aave/core-v3/contracts/interfaces/IPool.sol";

contract FlashLoan {
    function lend(address pool, address token, address user, uint256 amount) public {
        IPool(pool).supply(token, amount, user, 0);
    }
}