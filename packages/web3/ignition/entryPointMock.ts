import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const entryPointMockModule = buildModule("EntryPointMockModule", (m) => {
  const entryPointMock = m.contract("EntryPointMock", []);

  return { entryPointMock };
});

export default entryPointMockModule;