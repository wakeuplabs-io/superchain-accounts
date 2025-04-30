import optimismBadge from "@/assets/logos/optimism-chain-logo.svg";
import baseBadge from "@/assets/logos/base-chain-logo.svg";
import unichainBadge from "@/assets/logos/unichain-chain-logo.svg";
import { CHAINS } from "./chains";

export type Badge = {
  id: bigint;
  name: string;
  description: string;
  image?: string;
};

export const AVAILABLE_BADGES: { [chainId: number]: Badge[] } = {
  [CHAINS.optimism.id]: [
    {
      id: 1n,
      name: "Optimism Days active",
      description: "25 Days active on Optimism",
      image: optimismBadge,
    },
    {
      id: 2n,
      name: "Optimism Days Active",
      description: "50 Days active on Optimism ",
      image: optimismBadge,
    },
    {
      id: 3n,
      name: "Optimism Days active",
      description: "100 Days active on Optimism ",
      image: optimismBadge,
    },
    {
      id: 4n,
      name: "Optimism Transactions",
      description: "1 Transactions on Optimism ",
      image: optimismBadge,
    },
    {
      id: 5n,
      name: "Optimism Transactions",
      description: "5 Transactions on Optimism ",
      image: optimismBadge,
    },
    {
      id: 6n,
      name: "Optimism Transactions",
      description: "25 Transactions on Optimism ",
      image: optimismBadge,
    },
    {
      id: 7n,
      name: "Optimism Transactions",
      description: "50 Transactions on Optimism ",
      image: optimismBadge,
    },
    {
      id: 8n,
      name: "Optimism Transactions",
      description: "100 Transactions on Optimism ",
      image: optimismBadge,
    },
    {
      id: 9n,
      name: "Optimism Defi interactions",
      description: "25 Defi interactions on Optimism ",
      image: optimismBadge,
    },
    {
      id: 10n,
      name: "Optimism Defi interactions",
      description: "50 Defi interactions on Optimism ",
      image: optimismBadge,
    },
    {
      id: 11n,
      name: "Optimism Defi interactions",
      description: "100 Defi interactions on Optimism ",
      image: optimismBadge,
    },
  ],
  [CHAINS.base.id]: [
    {
      id: 1n,
      name: "Base Days active",
      description: "25 Days active on Base",
      image: baseBadge,
    },
    {
      id: 2n,
      name: "Base Days active",
      description: "50 Days active on Base",
      image: baseBadge,
    },
    {
      id: 3n,
      name: "Base Days active",
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
      name: "Base Defi interactions",
      description: "50 Defi interactions on Base",
      image: baseBadge,
    },
    {
      id: 9n,
      name: "Base Defi interactions",
      description: "100 Defi interactions on Base",
      image: baseBadge,
    },
  ],
  [CHAINS.unichain.id]: [
    {
      id: 1n,
      name: "Unichain Days active",
      description: "25 Days active on Unichain",
      image: unichainBadge,
    },
    {
      id: 2n,
      name: "Unichain Days active",
      description: "50 Days active on Unichain",
      image: unichainBadge,
    },
    {
      id: 3n,
      name: "Unichain Days active",
      description: "100 Days active on Unichain",
      image: unichainBadge,
    },
    {
      id: 4n,
      name: "Unichain Transactions",
      description: "25 Transactions on Unichain",
      image: unichainBadge,
    },
    {
      id: 5n,
      name: "Unichain Transactions",
      description: "50 Transactions on Unichain",
      image: unichainBadge,
    },
    {
      id: 6n,
      name: "Unichain Transactions",
      description: "100 Transactions on Unichain",
      image: unichainBadge,
    },
    {
      id: 7n,
      name: "Unichain Defi interactions",
      description: "25 Defi interactions on Unichain",
      image: unichainBadge,
    },
    {
      id: 8n,
      name: "Unichain Defi interactions",
      description: "50 Defi interactions on Unichain",
      image: unichainBadge,
    },
    {
      id: 9n,
      name: "Unichain Defi interactions",
      description: "100 Defi interactions on Unichain",
      image: unichainBadge,
    },
  ],
};
