// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ExplodingBlocksHelper.sol";
import "./ExplodingBlocksDices.sol";
import "hardhat/console.sol";

//   0  1  2  3  4  5  6  7  8
//0 [ ][ ][ ][ ][ ][ ][ ][ ][ ]
//1 [ ][1][ ][ ][4][ ][ ][7][ ]
//2 [ ][ ][ ][ ][ ][ ][ ][ ][ ]
//3 [ ][ ][ ][ ][ ][ ][ ][ ][ ]
//4 [ ][2][ ][ ][5][ ][ ][8][ ]
//5 [ ][ ][ ][ ][ ][ ][ ][ ][ ]
//6 [ ][ ][ ][ ][ ][ ][ ][ ][ ]
//7 [ ][3][ ][ ][6][ ][ ][9][ ]
//8 [ ][ ][ ][ ][ ][ ][ ][ ][ ]

error unableToAttack(string);
error unableToJoin();
error unableToRegroup();

contract ExplodingBlocks is ExplodingBlocksHelper, ExplodingBlocksDices {
    uint8 public constant MAX_PLAYERS = 9;

    event playerAttackDices(uint8[] player1Rolls, uint8[] player2Rolls);

    enum Status {
        WaitingForUsers,
        GameOn,
        GameEnd
    }

    struct GameInstance {
        Status status;
        string name;
        uint256 startTime;
    }

    struct Block {
        uint8 index;
        uint8 troops;
        address owner;
    }

    GameInstance public gameInstance;
    Block[MAX_PLAYERS ** 2] blocks;
    mapping(address => bool) public playerJoined;
    uint8 public playerCount;

    constructor(string memory _name) {
        gameInstance.name = _name;
        gameInstance.status = Status.WaitingForUsers;
    }

    function joinGame() public {
        if (playerJoined[msg.sender]) {
            revert unableToJoin();
        }
        if (gameInstance.status != Status.WaitingForUsers) {
            revert unableToJoin();
        }
        if (playerCount == MAX_PLAYERS) {
            revert unableToJoin();
        }

        playerJoined[msg.sender] = true;
        playerCount++;
        uint8 blockIndex = _getPlayerPosition(playerCount);
        Block memory playerBlock = Block({
            index: blockIndex,
            troops: 7,
            owner: msg.sender
        });
        blocks[blockIndex] = playerBlock;

        if (playerCount == MAX_PLAYERS) {
            gameInstance.status = Status.GameOn;
            gameInstance.startTime = block.timestamp + 1 days;
        }
    }

    function playerAttack(
        uint8 _blockIndexFrom,
        uint8 _numTroopsFrom,
        uint8 _blockIndexTo
    ) public {
        Block storage playerBlockFrom = blocks[_blockIndexFrom];
        Block storage playerBlockTo = blocks[_blockIndexTo];

        // console.log("status: %s", uint(gameInstance.status));

        if (gameInstance.status != Status.GameOn) {
            revert unableToAttack("Game is not on");
        }

        if (playerBlockFrom.owner != msg.sender) {
            revert unableToAttack("Player does not own the block");
        }
        if (playerBlockTo.owner == msg.sender) {
            revert unableToAttack("Player cannot attack its own block");
        }
        if (playerBlockFrom.troops - 1 < _numTroopsFrom) {
            revert unableToAttack("Not enough troops");
        }

        if (!_isBlockNextToTheOther(_blockIndexFrom, _blockIndexTo)) {
            revert unableToAttack("Block is not attackable");
        }

        // If the block is empty, the player can take it over
        if (playerBlockTo.owner == address(0)) {
            playerBlockFrom.troops--;
            Block memory blockTo = Block({
                index: _blockIndexTo,
                owner: msg.sender,
                troops: 1
            });
            blocks[_blockIndexTo] = blockTo;
            return;
        }

        // If the block is not empty, the players must roll the dices
        (
            uint8[] memory player1Rolls,
            uint8[] memory player2Rolls,
            uint8 player1Wins,
            uint8 player2Wins
        ) = rollDices(
                _numTroopsFrom,
                playerBlockTo.troops > 3 ? 3 : playerBlockTo.troops
            );

        // TODO: this logic does not make sense
        // If player 1 wins, the block should not be taken over, it has to propertly calculate the troops
        if (player1Wins > player2Wins) {
            // If player 1 wins, the block is taken over
            playerBlockTo.owner = playerBlockFrom.owner;
            playerBlockTo.troops = 1;
            playerBlockFrom.troops = player1Wins - player2Wins - 1;
        } else if (player2Wins > player1Wins) {
            // If player 2 wins, the block is defended
            playerBlockFrom.troops = playerBlockFrom.troops - player2Wins;
            playerBlockTo.troops = playerBlockTo.troops - player1Wins;
        }
        emit playerAttackDices(player1Rolls, player2Rolls);
    }

    function regroupTroops(
        uint8 _blockIndexFrom,
        uint8 _numTroopsFrom,
        uint8 _blockIndexTo
    ) public {
        Block storage playerBlockFrom = blocks[_blockIndexFrom];
        Block storage playerBlockTo = blocks[_blockIndexTo];

        if (playerBlockFrom.owner != msg.sender) {
            revert unableToRegroup();
        }
        if (playerBlockTo.owner != msg.sender) {
            revert unableToRegroup();
        }

        if (playerBlockFrom.troops < _numTroopsFrom) {
            revert unableToRegroup();
        }

        if (!_isBlockNextToTheOther(_blockIndexFrom, _blockIndexTo)) {
            revert unableToRegroup();
        }

        if (playerBlockFrom.troops - _numTroopsFrom < 1) {
            revert unableToRegroup();
        }

        playerBlockFrom.troops = playerBlockFrom.troops - _numTroopsFrom;
        playerBlockTo.troops = playerBlockTo.troops + _numTroopsFrom;
    }

    function getFullBoard()
        public
        view
        returns (
            Block[MAX_PLAYERS ** 2] memory,
            GameInstance memory,
            uint8 totalPlayers,
            bool isPlayerIn
        )
    {
        return (blocks, gameInstance, playerCount, playerJoined[msg.sender]);
    }
}
