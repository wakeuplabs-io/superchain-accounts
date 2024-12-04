import { Abi } from "viem";
import { defineConfig } from "@wagmi/cli";

import foobar from "./artifacts/contracts/foobar/contract.sol/Foobar.json";
import wakeUpPaymaster from "./artifacts/contracts/wakeUpPaymaster/contract.sol/WakeUpPaymaster.json";
import entryPointMock from "./artifacts/contracts/entryPointMock/contract.sol/EntryPointMock.json";

export default defineConfig({
  out: "./test/shared/abis/index.ts",
  contracts: [
    {
      name: "foobar",
      abi: foobar.abi as Abi,
    },
    {
      name: "wakeup-paymaster",
      abi: wakeUpPaymaster.abi as Abi,
    },
    {
      name: "entrypoint-mock",
      abi: entryPointMock.abi as Abi,
    }
  ],
});
