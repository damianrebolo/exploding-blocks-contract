import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ExplodingBlocksModule = buildModule("ExplodingBlocksModule", (m) => {
  const game = m.contract("ExplodingBlocksFactory", [], {});

  return { game };
});

export default ExplodingBlocksModule;
