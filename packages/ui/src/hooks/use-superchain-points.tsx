import { useWeb3 } from "./use-web3";
import { useSuperChainAccount } from "./use-smart-account";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pointsService } from "@/services";
import envParsed from "@/envParsed";
import superchainPoints from "@/config/abis/superchain-points";
import { encodeFunctionData } from "viem";

export const useSuperchainPoints = () => {
  const { chain } = useWeb3();
  const {
    account: { address },
    sendTransaction,
  } = useSuperChainAccount();
  const queryClient = useQueryClient();

  const { data: events, isPending: isEventsPending } = useQuery({
    queryKey: ["superchainPointsEvents", address ?? "0x0", chain.id],
    queryFn: async () => {
      const events = await pointsService.getUserPoints(
        address,
        String(chain.id)
      );

      return events;
    },
    initialData: [],
    staleTime: 0,
    refetchOnMount: true,
  });

  const {
    data: { balance, claimable },
    isPending: isStatePending,
  } = useQuery({
    queryKey: ["superchainPointsState", address ?? "0x0", chain.id],
    queryFn: async () => {
      const [balance, claimable] = await chain.client.multicall({
        contracts: [
          {
            address: envParsed().SUPERCHAIN_POINTS_ADDRESS as `0x${string}`,
            abi: superchainPoints,
            functionName: "balanceOf",
            args: [address],
          },
          {
            address: envParsed().SUPERCHAIN_POINTS_ADDRESS as `0x${string}`,
            abi: superchainPoints,
            functionName: "getClaimable",
            args: [address],
          },
        ],
      });

      return {
        balance: (balance.result as bigint) ?? 0,
        claimable: (claimable.result as bigint) ?? 0,
      };
    },
    initialData: { balance: 0n, claimable: 0n },
    refetchOnMount: true,
    staleTime: 0,
  });

  const { mutateAsync: claim, isPending: isClaiming } = useMutation({
    mutationFn: async () => {
      return sendTransaction({
        to: envParsed().SUPERCHAIN_POINTS_ADDRESS as `0x${string}`,
        value: 0n,
        data: encodeFunctionData({
          abi: superchainPoints,
          functionName: "claim",
          args: [],
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["superchainPointsState", address ?? "0x0", chain.id],
      });
    },
  });

  return {
    isPending: isStatePending || isEventsPending,
    isClaiming,
    claim,
    claimable,
    balance,
    events,
  };
};
