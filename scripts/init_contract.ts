import hre from "hardhat";
import { ExplodingBlocks, ExplodingBlocksFactory } from "../typechain-types";

async function main() {
  const [_, w1, w2, w3, w4, w5, w6, w7, w8, w9] = await hre.ethers.getSigners();
  const players = [w1, w2, w3, w4, w5, w6, w7, w8, w9];

  // Get the ContractFactory of your SimpleContract
  const ExplodingBlocksFactory = await hre.ethers.getContractFactory(
    "ExplodingBlocksFactory"
  );

  const ExplodingBlocks = await hre.ethers.getContractFactory(
    "ExplodingBlocks"
  );
  // Connect to the deployed contract
  const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
  const gameFactory = (await ExplodingBlocksFactory.attach(
    contractAddress
  )) as ExplodingBlocksFactory;

  await gameFactory.deployNewBoardGame("Board 1");
  const boards = await gameFactory.getBoardGames();

  const board0 = (await ExplodingBlocks.attach(boards[0])) as ExplodingBlocks;

  for (let i = 0; i < 9; i++) {
    await board0.connect(players[i]).joinGame();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
