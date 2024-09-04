import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { ExplodingBlocks } from "../typechain-types";

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

async function deployFactory() {
  const [_, w1, w2, w3, w4, w5, w6, w7, w8, w9] = await hre.ethers.getSigners();

  const ExplodingBlocksFactory = await hre.ethers.getContractFactory(
    "ExplodingBlocksFactory"
  );
  const ExplodingBlocks = await hre.ethers.getContractFactory(
    "ExplodingBlocks"
  );
  const explodingBlocksFactory = await ExplodingBlocksFactory.deploy();

  await explodingBlocksFactory.deployNewBoardGame("Andromeda");
  const boardGames = await explodingBlocksFactory.getBoardGames();

  const andromeda = ExplodingBlocks.attach(boardGames[0]) as ExplodingBlocks;

  for await (const w of [w1, w2, w3, w4, w5, w6, w7, w8, w9]) {
    await andromeda.connect(w).joinGame();
  }

  return {
    andromeda,
    _,
    w1,
    w2,
    w3,
    w4,
    w5,
    w6,
    w7,
    w8,
    w9,
  };
}

describe("Exploding Blocks - Join game", function () {
  it("Should not joint more than 9 wallets", async function () {
    const { andromeda, _, w9 } = await loadFixture(deployFactory);

    const [blocks, game, playerCount] = await andromeda.getFullBoard();
    expect(playerCount).to.equal(9);
    await expect(andromeda.connect(_).joinGame()).to.be.revertedWithCustomError(
      andromeda,
      "unableToJoin"
    );
    await expect(
      andromeda.connect(w9).joinGame()
    ).to.be.revertedWithCustomError(andromeda, "unableToJoin");
  });

  it("Should match the order or the player joined with board position", async function () {
    const { andromeda, w1, w2, w3, w4, w5, w6, w7, w8, w9 } = await loadFixture(
      deployFactory
    );

    const [blocks, game, playerCount] = await andromeda.getFullBoard();

    const wallets = [w1, w2, w3, w4, w5, w6, w7, w8, w9];

    for (const [index, value] of [
      10, 13, 16, 37, 40, 43, 64, 67, 70,
    ].entries()) {
      const [_, trops, owner] = blocks[value];
      expect(owner).to.equal(await wallets[index].getAddress());
    }
  });

  it("Should be ongoing game status starting soon", async function () {
    const { andromeda } = await loadFixture(deployFactory);

    const [blocks, game, playerCount] = await andromeda.getFullBoard();
    expect(game.status).to.equal(1);
  });

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
});

describe("Exploding Blocks - Attack", function () {
  it("Should prevent attacking", async function () {
    const { andromeda, w1 } = await loadFixture(deployFactory);

    await expect(
      andromeda.connect(w1).playerAttack(10, 3, 10)
    ).to.be.revertedWithCustomError(andromeda, "unableToAttack");
    await expect(
      andromeda.connect(w1).playerAttack(10, 2, 8)
    ).to.be.revertedWithCustomError(andromeda, "unableToAttack");
    await expect(
      andromeda.connect(w1).playerAttack(10, 7, 9)
    ).to.be.revertedWithCustomError(andromeda, "unableToAttack");
  });
  it("Should attack", async function () {
    const { andromeda, w1 } = await loadFixture(deployFactory);

    await andromeda.connect(w1).playerAttack(10, 3, 9);
    const [blocks, game, playerCount] = await andromeda.getFullBoard();
    const [_, trops, owner] = blocks[9];
    expect(owner).to.equal(await w1.getAddress());
    expect(trops).to.equal(1);
  });
});

describe("Exploding Blocks - Regroup", function () {
  it("Should prevent regroup", async function () {
    const { andromeda, w1 } = await loadFixture(deployFactory);

    await expect(
      andromeda.connect(w1).regroupTroops(10, 3, 11)
    ).to.be.revertedWithCustomError(andromeda, "unableToRegroup");
    await andromeda.connect(w1).playerAttack(10, 3, 9);
    await expect(
      andromeda.connect(w1).regroupTroops(10, 7, 9)
    ).to.be.revertedWithCustomError(andromeda, "unableToRegroup");
  });

  it("Should regroup", async function () {
    const { andromeda, w1 } = await loadFixture(deployFactory);

    await expect(
      andromeda.connect(w1).regroupTroops(10, 3, 11)
    ).to.be.revertedWithCustomError(andromeda, "unableToRegroup");
    await andromeda.connect(w1).playerAttack(10, 3, 9);
    await andromeda.connect(w1).regroupTroops(10, 3, 9);

    const [blocks, game, playerCount] = await andromeda.getFullBoard();
    const [_2, trops10, owner10] = blocks[10];
    const [_, trops9, owner9] = blocks[9];
    expect(trops9).to.equal(4);
    expect(trops10).to.equal(3);
    expect(owner9).to.equal(await w1.getAddress());
    expect(owner10).to.equal(await w1.getAddress());
  });
});
