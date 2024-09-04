import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ExplodingBlocksNftsModule = buildModule(
  "ExplodingBlocksNftsModule",
  (m) => {
    const gameNfts = m.contract("ExplodingBlocksNfts", [], {});

    return { gameNfts };
  }
);

export default ExplodingBlocksNftsModule;
