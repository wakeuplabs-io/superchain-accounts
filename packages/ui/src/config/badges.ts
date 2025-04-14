import { baseSepolia, optimismSepolia, unichainSepolia } from "viem/chains";

// TODO: update with real badges once available
import optimismBadge from "@/assets/logos/optimism-chain-logo.svg";
import baseBadge from "@/assets/logos/base-chain-logo.svg";
import unichainBadge from "@/assets/logos/unichain-chain-logo.svg";

export type Badge = {
  id: bigint;
  name: string;
  description: string;
  image?: string;
};

export const AVAILABLE_BADGES: { [chainId: number]: Badge[] } = {
  [optimismSepolia.id]: [
    {
      id: 1n,
      name: "OP Days Active",
      description: "25 Days active on Optimism ",
      image: optimismBadge,
    },
    {
      id: 2n,
      name: "OP Days Active",
      description: "50 Days active on Optimism ",
      image: optimismBadge,
    },
    {
      id: 3n,
      name: "OP Days Active",
      description: "100 Days active on Optimism ",
      image: optimismBadge,
    },
    {
      id: 4n,
      name: "OP Transactions",
      description: "25 Transactions on Optimism ",
      image: optimismBadge,
    },
    {
      id: 5n,
      name: "OP Transactions",
      description: "50 Transactions on Optimism ",
      image: optimismBadge,
    },
    {
      id: 6n,
      name: "OP Transactions",
      description: "100 Transactions on Optimism ",
      image: optimismBadge,
    },
    {
      id: 7n,
      name: "OP Defi",
      description: "25 Defi interactions on Optimism ",
      image: optimismBadge,
    },
    {
      id: 8n,
      name: "OP Defi",
      description: "50 Defi interactions on Optimism ",
      image: optimismBadge,
    },
    {
      id: 9n,
      name: "OP Defi",
      description: "100 Defi interactions on Optimism ",
      image: optimismBadge,
    },
  ],
  [baseSepolia.id]: [
    {
      id: 1n,
      name: "Base Days Active",
      description: "25 Days active on Base",
      image: baseBadge,
    },
    {
      id: 2n,
      name: "Base Days Active",
      description: "50 Days active on Base",
      image: baseBadge,
    },
    {
      id: 3n,
      name: "Base Days Active",
      description: "100 Days active on Base",
      image: baseBadge,
    },
    {
      id: 4n,
      name: "Base Transactions",
      description: "25 Transactions on Base",
      image: baseBadge,
    },
    {
      id: 5n,
      name: "Base Transactions",
      description: "50 Transactions on Base",
      image: baseBadge,
    },
    {
      id: 6n,
      name: "Base Transactions",
      description: "100 Transactions on Base",
      image: baseBadge,
    },
    {
      id: 7n,
      name: "Base Defi",
      description: "25 Defi interactions on Base",
      image: baseBadge,
    },
    {
      id: 8n,
      name: "Base Defi",
      description: "50 Defi interactions on Base",
      image: baseBadge,
    },
    {
      id: 9n,
      name: "Base Defi",
      description: "100 Defi interactions on Base",
      image: baseBadge,
    },
  ],
  [unichainSepolia.id]: [
    {
      id: 1n,
      name: "OP Uni Active",
      description: "25 Days active on Unichain",
      image: unichainBadge,
    },
    {
      id: 2n,
      name: "OP Uni Active",
      description: "50 Days active on Unichain",
      image: unichainBadge,
    },
    {
      id: 3n,
      name: "OP Uni Active",
      description: "100 Days active on Unichain",
      image: unichainBadge,
    },
    {
      id: 4n,
      name: "Uni Transactions",
      description: "25 Transactions on Unichain",
      image: unichainBadge,
    },
    {
      id: 5n,
      name: "Uni Transactions",
      description: "50 Transactions on Unichain",
      image: unichainBadge,
    },
    {
      id: 6n,
      name: "Uni Transactions",
      description: "100 Transactions on Unichain",
      image: unichainBadge,
    },
    {
      id: 7n,
      name: "Uni Defi",
      description: "25 Defi interactions on Unichain",
      image: unichainBadge,
    },
    {
      id: 8n,
      name: "Uni Defi",
      description: "50 Defi interactions on Unichain",
      image: unichainBadge,
    },
    {
      id: 9n,
      name: "Uni Defi",
      description: "100 Defi interactions on Unichain",
      image: unichainBadge,
    },
  ],
};
