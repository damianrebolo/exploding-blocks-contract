// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ExplodingBlocksHelper.sol";

contract ExplodingBlocksHelperTest is ExplodingBlocksHelper {
    function isBlockNextToTheOther(
        uint8 indexFrom,
        uint8 indexTo
    ) public pure returns (bool) {
        return _isBlockNextToTheOther(indexFrom, indexTo);
    }
}
