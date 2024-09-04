// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ExplodingBlocks.sol";

contract ExplodingBlocksFactory {
    address[] public boardGames;

    function deployNewBoardGame(string memory _name) public {
        ExplodingBlocks newBoardGame = new ExplodingBlocks(_name);

        boardGames.push(address(newBoardGame));
    }

    function getBoardGames() public view returns (address[] memory) {
        return boardGames;
    }
}
