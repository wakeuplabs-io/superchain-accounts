import envParsed from "@/envParsed";
import { Address, encodeFunctionData, zeroAddress } from "viem";
import { useWeb3 } from "./use-web3";
import superchainPointsRaffleFactory from "@/config/abis/superchain-points-raffle-factory";
import superchainPointsRaffle from "@/config/abis/superchain-points-raffle";
import { useSuperChainAccount } from "./use-smart-account";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useSuperchainRaffle = (): {
  claimTickets: () => Promise<string>;
  isClaiming: boolean;
  isPending: boolean;
  currentRaffle: {
    address: Address;
    claimableTickets: bigint;
    claimedTickets: bigint;
    totalTickets: bigint;
    jackpot: bigint;
    revealedAt: Date;
  } | null;
} => {
  const { chain } = useWeb3();
  const {
    account: { address },
    sendTransaction,
  } = useSuperChainAccount();
  const queryClient = useQueryClient();

  const { data: currentRaffle, isPending } = useQuery({
    queryKey: ["currentRaffle", address ?? "0x0", chain?.id],
    enabled: address != zeroAddress && !!chain,
    queryFn: async () => {
      const currentRaffle = (await chain.client.readContract({
        abi: superchainPointsRaffleFactory,
        functionName: "currentRaffle",
        address: envParsed()
          .SUPERCHAIN_POINTS_RAFFLE_FACTORY_ADDRESS as Address,
      })) as Address;
      if (!currentRaffle || currentRaffle === zeroAddress) {
        return null;
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
            address: currentRaffle,
            args: [address],
          },
          {
            functionName: "getClaimedTickets",
            abi: superchainPointsRaffle,
            address: currentRaffle,
            args: [address],
          },
          {
            functionName: "getTotalTickets",
            abi: superchainPointsRaffle,
            address: currentRaffle,
          },
          {
            functionName: "getJackpot",
            abi: superchainPointsRaffle,
            address: currentRaffle,
          },
          {
            functionName: "getRevealedAfter",
            abi: superchainPointsRaffle,
            address: currentRaffle,
          },
        ],
      });

      return {
        address: currentRaffle,
        claimableTickets: BigInt((claimableTickets.result as bigint) ?? 0n),
        claimedTickets: BigInt((claimedTickets.result as bigint) ?? 0n),
        totalTickets: BigInt((totalTickets.result as bigint) ?? 0n),
        revealedAt: new Date(Number(revealedAt.result ?? 0n) * 1000),
        jackpot: BigInt((prizeAmount.result as bigint) ?? 0n),
      };
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  const { mutateAsync: claimTickets, isPending: isClaiming } = useMutation({
    mutationFn: async () => {
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

      return txHash;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["currentRaffle", address, chain.id],
      }),
  });

  return {
    isPending: isPending || currentRaffle === undefined,
    currentRaffle: currentRaffle ?? null,
    isClaiming,
    claimTickets,
  };
};
