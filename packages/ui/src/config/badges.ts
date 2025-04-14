import { baseSepolia, optimismSepolia, unichainSepolia } from "viem/chains";

export type Badge = {
  id: bigint;
  name: string;
  description: string;
  imageUrl?: string;
};

// TODO: properly update with real badges task OSA-113
export const AVAILABLE_BADGES: { [chainId: number]: Badge[] } = {
  [optimismSepolia.id]: [
    {
      id: 2n,
      name: "Badge 2",
      description: "Description 2",
      imageUrl:
        "http://localhost:3000/src/assets/logos/optimism-chain-logo.svg",
    },
    {
      id: 4n,
      name: "Badge 4",
      description: "Description 4",
      imageUrl:
        "http://localhost:3000/src/assets/logos/optimism-chain-logo.svg",
    },
  ],
  [baseSepolia.id]: [],
  [unichainSepolia.id]: [],
};
