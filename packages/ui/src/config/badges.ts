import optimismBadge from "@/assets/logos/optimism-chain-logo.svg";
import baseBadge from "@/assets/logos/base-chain-logo.svg";
import unichainBadge from "@/assets/logos/unichain-chain-logo.svg";
import { CHAINS } from "./chains";

export type Badge = {
  id: bigint;
  name: string;
  description: string;
  image?: string;
  nftUrl: string;
};

export const AVAILABLE_BADGES: { [chainId: number]: Badge[] } = {
  [CHAINS.optimism.id]: [
    {
      id: 1n,
      name: "Optimism Days active",
      description: "25 Days active on Optimism",
      image: optimismBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/OPTIMISM/DAYS-ACTIVE/25-days-active---optimism.png"
    },
    {
      id: 2n,
      name: "Optimism Days Active",
      description: "50 Days active on Optimism ",
      image: optimismBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/OPTIMISM/DAYS-ACTIVE/50-days-active---optimism.png"
    },
    {
      id: 3n,
      name: "Optimism Days active",
      description: "100 Days active on Optimism ",
      image: optimismBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/OPTIMISM/DAYS-ACTIVE/100-days-active---optimism.png"
    },
    {
      id: 4n,
      name: "Optimism Transactions",
      description: "1 Transactions on Optimism ",
      image: optimismBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/OPTIMISM/TRANSACTIONS/1-transactions---optimism.png"
    },
    {
      id: 5n,
      name: "Optimism Transactions",
      description: "5 Transactions on Optimism ",
      image: optimismBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/OPTIMISM/TRANSACTIONS/5-transactions---optimism.png"
    },
    {
      id: 6n,
      name: "Optimism Transactions",
      description: "25 Transactions on Optimism ",
      image: optimismBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/OPTIMISM/TRANSACTIONS/25-transactions---optimism.png"
    },
    {
      id: 7n,
      name: "Optimism Transactions",
      description: "50 Transactions on Optimism ",
      image: optimismBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/OPTIMISM/TRANSACTIONS/50-transactions---optimism.png"
    },
    {
      id: 8n,
      name: "Optimism Transactions",
      description: "100 Transactions on Optimism ",
      image: optimismBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/OPTIMISM/TRANSACTIONS/100-transactions---optimism.png"
    },
    {
      id: 9n,
      name: "Optimism Defi interactions",
      description: "25 Defi interactions on Optimism ",
      image: optimismBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/OPTIMISM/DEFI-INTERACTIONS/25-defi-interactions---optimism.png"
    },
    {
      id: 10n,
      name: "Optimism Defi interactions",
      description: "50 Defi interactions on Optimism ",
      image: optimismBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/OPTIMISM/DEFI-INTERACTIONS/50-defi-interactions---optimism.png"
    },
    {
      id: 11n,
      name: "Optimism Defi interactions",
      description: "100 Defi interactions on Optimism ",
      image: optimismBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/OPTIMISM/DEFI-INTERACTIONS/100-defi-interactions---optimism.png"
    },
  ],
  [CHAINS.base.id]: [
    {
      id: 1n,
      name: "Base Days active",
      description: "25 Days active on Base",
      image: baseBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/BASE/DAYS-ACTIVE/25-days-active---base.png"
    },
    {
      id: 2n,
      name: "Base Days active",
      description: "50 Days active on Base",
      image: baseBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/BASE/DAYS-ACTIVE/50-days-active---base.png"
    },
    {
      id: 3n,
      name: "Base Days active",
      description: "100 Days active on Base",
      image: baseBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/BASE/DAYS-ACTIVE/100-days-active---base.png"
    },
    {
      id: 4n,
      name: "Base Transactions",
      description: "1 Transactions on Base",
      image: baseBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/BASE/TRANSACTIONS/1-transactions---base.png"
    },
    {
      id: 5n,
      name: "Base Transactions",
      description: "5 Transactions on Base",
      image: baseBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/BASE/TRANSACTIONS/5-transactions---base.png"
    },
    {
      id: 6n,
      name: "Base Transactions",
      description: "25 Transactions on Base",
      image: baseBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/BASE/TRANSACTIONS/25-transactions---base.png"
    },
    {
      id: 7n,
      name: "Base Transactions",
      description: "50 Transactions on Base",
      image: baseBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/BASE/TRANSACTIONS/50-transactions---base.png"
    },
    {
      id: 8n,
      name: "Base Transactions",
      description: "100 Transactions on Base",
      image: baseBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/BASE/TRANSACTIONS/100-transactions---base.png"
    },
    {
      id: 9n,
      name: "Base Defi",
      description: "25 Defi interactions on Base",
      image: baseBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/BASE/DEFI-INTERACTIONS/25-defi-interactions---base.png"
    },
    {
      id: 10n,
      name: "Base Defi interactions",
      description: "50 Defi interactions on Base",
      image: baseBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/BASE/DEFI-INTERACTIONS/50-defi-interactions---base.png"
    },
    {
      id: 11n,
      name: "Base Defi interactions",
      description: "100 Defi interactions on Base",
      image: baseBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/BASE/DEFI-INTERACTIONS/100-defi-interactions---base.png"
    },
  ],
  [CHAINS.unichain.id]: [
    {
      id: 1n,
      name: "Unichain Days active",
      description: "25 Days active on Unichain",
      image: unichainBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/UNICHAIN/DAYS-ACTIVE/25-days-active---unichain.png"
    },
    {
      id: 2n,
      name: "Unichain Days active",
      description: "50 Days active on Unichain",
      image: unichainBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/UNICHAIN/DAYS-ACTIVE/50-days-active---unichain.png"
    },
    {
      id: 3n,
      name: "Unichain Days active",
      description: "100 Days active on Unichain",
      image: unichainBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/UNICHAIN/DAYS-ACTIVE/100-days-active---unichain.png"
    },
    {
      id: 4n,
      name: "Unichain Transactions",
      description: "1 Transactions on Unichain",
      image: unichainBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/UNICHAIN/TRANSACTIONS/1-transactions---unichain.png"
    },
    {
      id: 5n,
      name: "Unichain Transactions",
      description: "5 Transactions on Unichain",
      image: unichainBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/UNICHAIN/TRANSACTIONS/5-transactions---unichain.png"
    },
    {
      id: 6n,
      name: "Unichain Transactions",
      description: "25 Transactions on Unichain",
      image: unichainBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/UNICHAIN/TRANSACTIONS/25-transactions---unichain.png"
    },
    {
      id: 7n,
      name: "Unichain Transactions",
      description: "50 Transactions on Unichain",
      image: unichainBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/UNICHAIN/TRANSACTIONS/50-transactions---unichain.png"
    },
    {
      id: 8n,
      name: "Unichain Transactions",
      description: "100 Transactions on Unichain",
      image: unichainBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/UNICHAIN/TRANSACTIONS/100-transactions---unichain.png"
    },
    {
      id: 9n,
      name: "Unichain Defi interactions",
      description: "25 Defi interactions on Unichain",
      image: unichainBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/UNICHAIN/DEFI-INTERACTION/25-defi-interactions---unichain.png"
    },
    {
      id: 10n,
      name: "Unichain Defi interactions",
      description: "50 Defi interactions on Unichain",
      image: unichainBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/UNICHAIN/DEFI-INTERACTION/50-defi-interactions---unichain.png"
    },
    {
      id: 11n,
      name: "Unichain Defi interactions",
      description: "100 Defi interactions on Unichain",
      image: unichainBadge,
      nftUrl: "https://superchain-badges.s3.amazonaws.com/NFT/UNICHAIN/DEFI-INTERACTION/100-defi-interactions---unichain.png"
    },
  ],
};
