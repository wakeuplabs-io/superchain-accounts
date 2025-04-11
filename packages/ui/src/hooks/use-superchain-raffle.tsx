import envParsed from "@/envParsed";
import { encodeFunctionData, zeroAddress } from "viem";
import { useWeb3 } from "./use-web3";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import superchainPointsRaffleFactory from "@/config/abis/superchain-points-raffle-factory";
import superchainPointsRaffle from "@/config/abis/superchain-points-raffle";
import { useSuperChainAccount } from "./use-smart-account";

type RaffleContextType = {
  isPending: boolean;
  isClaiming: boolean;
  claimTickets: () => Promise<string | undefined>;
  currentRaffle: {
    address: `0x${string}`;
    claimableTickets: number;
    claimedTickets: number;
    totalTickets: number;
    revealedAt: number;
    jackpot: number;
  } | null;
};

const SuperchainRaffleContext = createContext<RaffleContextType | undefined>(
  undefined
);

export const useSuperchainRaffle = () => {
  const context = useContext(SuperchainRaffleContext);
  if (!context) {
    throw new Error(
      "useSuperchainRaffle must be used within a SuperchainRaffleProvider"
    );
  }
  return context;
};

export const SuperchainRaffleProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { chain } = useWeb3();
  const {
    account: { address },
    sendTransaction,
  } = useSuperChainAccount();
  const [isPending, setIsPending] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const [currentRaffle, setCurrentRaffle] = useState<{
    address: `0x${string}`;
    claimableTickets: number;
    claimedTickets: number;
    totalTickets: number;
    revealedAt: number;
    jackpot: number;
  } | null>(null);

  useEffect(() => {
    async function loadRaffle() {
      if (!chain || !address) {
        return;
      }

      // from factory ready current raffle
      const currentRaffle = (await chain.client.readContract({
        abi: superchainPointsRaffleFactory,
        functionName: "currentRaffle",
        address: envParsed()
          .SUPERCHAIN_POINTS_RAFFLE_FACTORY_ADDRESS as `0x${string}`,
        args: [],
      })) as `0x${string}`;
      if (!currentRaffle || currentRaffle === zeroAddress) {
        return setCurrentRaffle(null);
      }

      const [
        claimableTickets,
        claimedTickets,
        totalTickets,
        prizeAmount,
        revealedAt,
      ] = await chain.client.multicall({
        contracts: [
          {
            functionName: "getClaimableTickets",
            abi: superchainPointsRaffle,
            address: currentRaffle as `0x${string}`,
            args: [address],
          },
          {
            functionName: "getClaimedTickets",
            abi: superchainPointsRaffle,
            address: currentRaffle as `0x${string}`,
            args: [address],
          },
          {
            functionName: "getTotalTickets",
            abi: superchainPointsRaffle,
            address: currentRaffle as `0x${string}`,
            args: [],
          },
          {
            functionName: "getJackpot",
            abi: superchainPointsRaffle,
            address: currentRaffle as `0x${string}`,
            args: [],
          },
          {
            functionName: "getRevealedAfter",
            abi: superchainPointsRaffle,
            address: currentRaffle as `0x${string}`,
            args: [],
          },
        ],
      });

      setCurrentRaffle({
        address: currentRaffle as `0x${string}`,
        claimableTickets: Number(claimableTickets.result ?? 0),
        claimedTickets: Number(claimedTickets.result ?? 0),
        totalTickets: Number(totalTickets.result ?? 0),
        revealedAt: Number(revealedAt.result ?? 0n) * 1000,
        jackpot: Number(prizeAmount.result ?? 0),
      });
    }

    setIsPending(true);
    loadRaffle()
      .catch(() => setCurrentRaffle(null))
      .finally(() => setIsPending(false));
  }, [address, chain]);

  const claimTickets = useCallback(async () => {
    setIsClaiming(true);

    try {
      if (!currentRaffle) {
        throw new Error("No current raffle");
      }

      const txHash = await sendTransaction({
        to: currentRaffle.address,
        value: 0n,
        data: encodeFunctionData({
          abi: superchainPointsRaffle,
          functionName: "claimTickets",
          args: [],
        }),
      });

      setCurrentRaffle({
        ...currentRaffle,
        claimableTickets: 0,
        claimedTickets:
          currentRaffle.claimedTickets + currentRaffle.claimableTickets,
        totalTickets:
          currentRaffle.totalTickets + currentRaffle.claimableTickets,
      });

      return txHash;
    } finally {
      setIsClaiming(false);
    }
  }, [chain, sendTransaction, currentRaffle]);

  return (
    <SuperchainRaffleContext.Provider
      value={{
        isPending,
        isClaiming,
        claimTickets,
        currentRaffle,
      }}
    >
      {children}
    </SuperchainRaffleContext.Provider>
  );
};
