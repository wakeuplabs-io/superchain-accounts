import { baseSepolia, optimismSepolia, unichainSepolia } from "viem/chains";

// TODO: update with real badges once available
import optimismBadge from "@/assets/logos/optimism-chain-logo.svg";

export type Badge = {
  id: bigint;
  name: string;
  description: string;
  image?: string;
};

// TODO: properly update with real badges task OSA-113
export const AVAILABLE_BADGES: { [chainId: number]: Badge[] } = {
  [optimismSepolia.id]: [
    {
      id: 2n,
      name: "Badge 2",
      description: "Description 2",
      image: optimismBadge,
    },
    {
      id: 4n,
      name: "Badge 4",
      description: "Description 4",
      image: optimismBadge,
    },
  ],
  [baseSepolia.id]: [],
  [unichainSepolia.id]: [],
};
