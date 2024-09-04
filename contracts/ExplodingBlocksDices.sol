// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract ExplodingBlocksDices {
    // Function to roll a dice and return a number between 1 and 6
    function rollDice() private view returns (uint8) {
        return
            uint8(
                (uint256(
                    keccak256(
                        abi.encodePacked(
                            block.timestamp,
                            block.prevrandao,
                            msg.sender,
                            gasleft()
                        )
                    )
                ) % 6) + 1
            );
    }

    // Function to roll multiple dice
    function rollMultipleDice(
        uint8 numDice
    ) private view returns (uint8[] memory) {
        uint8[] memory diceRolls = new uint8[](numDice);
        for (uint8 i = 0; i < numDice; i++) {
            diceRolls[i] = rollDice();
        }
        return diceRolls;
    }

    // Function to sort an array in descending order
    function sortDescending(
        uint8[] memory array
    ) private pure returns (uint8[] memory) {
        for (uint i = 0; i < array.length; i++) {
            for (uint j = i + 1; j < array.length; j++) {
                if (array[i] < array[j]) {
                    uint8 temp = array[i];
                    array[i] = array[j];
                    array[j] = temp;
                }
            }
        }
        return array;
    }

    // Function to play the dice game and determine the winner
    function rollDices(
        uint8 player1Dice,
        uint8 player2Dice
    )
        public
        view
        returns (
            uint8[] memory player1Rolls,
            uint8[] memory player2Rolls,
            uint8 player1Wins,
            uint8 player2Wins
        )
    {
        require(
            player1Dice >= 1 && player1Dice <= 3,
            "Player 1 must roll between 1 and 3 dice"
        );
        require(
            player2Dice >= 1 && player2Dice <= 3,
            "Player 2 must roll between 1 and 3 dice"
        );

        player1Rolls = rollMultipleDice(player1Dice);
        player2Rolls = rollMultipleDice(player2Dice);

        player1Rolls = sortDescending(player1Rolls);
        player2Rolls = sortDescending(player2Rolls);

        player1Wins = 0;
        player2Wins = 0;

        for (
            uint i = 0;
            i < player1Rolls.length && i < player2Rolls.length;
            i++
        ) {
            if (player1Rolls[i] > player2Rolls[i]) {
                player1Wins++;
            } else if (player2Rolls[i] > player1Rolls[i]) {
                player2Wins++;
            } else {
                // If numbers are equal, the player defending (Player 2) wins
                player2Wins++;
            }
        }

        return (player1Rolls, player2Rolls, player1Wins, player2Wins);
    }
}
