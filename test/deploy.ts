import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { ExplodingBlocks } from "../typechain-types";

describe("Exploding Blocks - Deploy Instances", function () {
  async function deployFactory() {
    const [_] = await hre.ethers.getSigners();

    const ExplodingBlocksFactory = await hre.ethers.getContractFactory(
      "ExplodingBlocksFactory"
    );
    const ExplodingBlocks = await hre.ethers.getContractFactory(
      "ExplodingBlocks"
    );
    const explodingBlocksFactory = await ExplodingBlocksFactory.deploy();

    return {
      explodingBlocksFactory,
      ExplodingBlocks,
      _,
    };
  }

  it("Should create a boardgame", async function () {
    const { explodingBlocksFactory, _ } = await loadFixture(deployFactory);

    await explodingBlocksFactory.deployNewBoardGame("Test Game");
    const boardGames = await explodingBlocksFactory.getBoardGames();

    expect(boardGames.length).to.equal(1);
  });

  it("Should get boardgame instance", async function () {
    const { explodingBlocksFactory, ExplodingBlocks, _ } = await loadFixture(
      deployFactory
    );

    await explodingBlocksFactory.deployNewBoardGame("Test Game");
    const boardGames = await explodingBlocksFactory.getBoardGames();

    const isntance0 = ExplodingBlocks.attach(boardGames[0]) as ExplodingBlocks;
    const [blocks, gameData, playerCount] = await isntance0.getFullBoard();

    const [status, name, start, end] = gameData;

    expect(blocks.length).to.equal(81);
    expect(gameData.length).to.equal(3);
    expect(status).to.equal(0);
    expect(name).to.equal("Test Game");
    expect(start).to.equal(0);
    expect(playerCount).to.equal(0);
  });
});
