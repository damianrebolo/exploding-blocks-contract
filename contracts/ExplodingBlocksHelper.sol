// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "hardhat/console.sol";

contract ExplodingBlocksHelper {
    function _getPlayerPosition(
        uint8 playerNumber
    ) internal pure returns (uint8 index) {
        if (playerNumber == 1) {
            return 10;
        } else if (playerNumber == 2) {
            return 13;
        } else if (playerNumber == 3) {
            return 16;
        } else if (playerNumber == 4) {
            return 37;
        } else if (playerNumber == 5) {
            return 40;
        } else if (playerNumber == 6) {
            return 43;
        } else if (playerNumber == 7) {
            return 64;
        } else if (playerNumber == 8) {
            return 67;
        } else if (playerNumber == 9) {
            return 70;
        }
    }

    function _isBlockNextToTheOther(
        uint8 indexFrom,
        uint8 indexTo
    ) internal pure returns (bool) {
        uint8 size = 9; // Size of the 9x9 matrix

        require(indexFrom < size * size, "Index out of bounds");
        require(indexTo < size * size, "indexTo out of bounds");

        // Calculate row and column based on the index
        uint8 row = indexFrom / size;
        uint col = indexFrom % size;

        // Initialize adjacent indices
        uint left;
        uint right;
        uint top;
        uint bottom;

        // Calculate the adjacent indices with proper boundary checks
        left = (col > 0) ? indexFrom - 1 : indexFrom + (size - 1); // Wrap around to the last column of the same row
        right = (col < size - 1) ? indexFrom + 1 : indexFrom - (size - 1); // Wrap around to the first column of the same row
        top = (row > 0) ? indexFrom - size : indexFrom + size * (size - 1); // Wrap around to the last row of the same column
        bottom = (row < size - 1)
            ? indexFrom + size
            : indexFrom - size * (size - 1); // Wrap around to the first row of the same column

        // Check if the indexTo is one of the adjacent positions
        return (indexTo == left ||
            indexTo == right ||
            indexTo == top ||
            indexTo == bottom);
    }
}
