import { useWeb3 } from "./use-web3";
import { useSuperChainAccount } from "./use-smart-account";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import envParsed from "@/envParsed";
import { encodeFunctionData, zeroAddress } from "viem";
import superchainBadges from "@/config/abis/superchain-badges";
import { AVAILABLE_BADGES } from "@/config/badges";

export const useSuperchainBadges = () => {
  const { chain } = useWeb3();
  const {
    account: { address },
    sendTransaction,
  } = useSuperChainAccount();
  const queryClient = useQueryClient();

  const { data: superchainBadgesState, isPending: isStatePending } = useQuery({
    refetchOnMount: true,
    enabled: address != zeroAddress,
    queryKey: ["superchainBadges", address ?? "0x0", chain.id],
    queryFn: async () => {
      const [balances, claimable] = await chain.client.multicall({
        contracts: [
          {
            address: envParsed().SUPERCHAIN_BADGES_ADDRESS as `0x${string}`,
            abi: superchainBadges,
            functionName: "balanceOfBatch",
            args: [
              AVAILABLE_BADGES[chain.id].map(() => address),
              AVAILABLE_BADGES[chain.id].map((b) => b.id),
            ],
          },
          {
            address: envParsed().SUPERCHAIN_BADGES_ADDRESS as `0x${string}`,
            abi: superchainBadges,
            functionName: "getClaimable",
            args: [address],
          },
        ],
      });

      return {
        badges: AVAILABLE_BADGES[chain.id].filter(
          (_, i) => (balances.result as bigint[])![i] > 0n
        ),
        claimable: AVAILABLE_BADGES[chain.id].filter((b) =>
          (claimable.result as bigint[]).includes(b.id)
        ),
      };
    },
  });

  const { mutateAsync: claim, isPending: isClaiming } = useMutation({
    mutationFn: async (tokenId: bigint) => {
      return sendTransaction({
        to: envParsed().SUPERCHAIN_BADGES_ADDRESS as `0x${string}`,
        value: 0n,
        data: encodeFunctionData({
          abi: superchainBadges,
          functionName: "claim",
          args: [tokenId],
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["superchainBadges", address ?? "0x0", chain.id],
      });
    },
  });

  return {
    isPending: isStatePending || superchainBadgesState === undefined,
    claimable: superchainBadgesState?.claimable ?? [],
    badges: superchainBadgesState?.badges ?? [],
    isClaiming,
    claim,
  };
};
