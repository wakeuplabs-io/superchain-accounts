import { useWeb3 } from "./use-web3";
import { useSuperChainAccount } from "./use-smart-account";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import envParsed from "@/envParsed";
import { encodeFunctionData, zeroAddress } from "viem";
import superchainBadges from "@/config/abis/superchain-badges";
import { AVAILABLE_BADGES } from "@/config/badges";
import { Badge } from "@/config/badges";
import axios from "axios";

export type SuperchainBadge = Badge & {status: "pending" | "claimed" | "unclaimed"};

export const useSuperchainBadges = () => {
  const { chain } = useWeb3();
  const {
    account: { address },
    sendTransaction,
  } = useSuperChainAccount();
  const queryClient = useQueryClient();

  const { data: superChainBadges, isPending: isStatePending } = useQuery({
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

      const claimableIds = (claimable.result as bigint[]);
      
      const claimableMultiCall: {address: `0x${string}`, abi: any, functionName: string, args: any}[] = claimableIds.map((claimableId) => ({
        address: envParsed().SUPERCHAIN_BADGES_ADDRESS as `0x${string}`,
        abi: superchainBadges,
        functionName: "uri",
        args: [claimableId],
      }))

      const [claimableMetadataResponse = { result: [] }] = await chain.client.multicall({
        contracts: claimableMultiCall
      });

      const claimableMetadataUris = claimableMetadataResponse.result as string[]

      const claimableImages = [] =  await Promise.all(
        claimableMetadataUris.map(async(uri, index) => { 
          return {
            id: claimableIds[index],
            imageUrl: (await axios.get(uri)).data.image
          }
        }
      ))

      return AVAILABLE_BADGES[chain.id].map((badge, index) => {
        return {
          ...badge,
          nftImageUrl: claimableImages[claimableIds.indexOf(badge.id)]?.imageUrl,
          status:
             (balances.result as bigint[])![index] > 0n
               ? "claimed"
               : (claimable.result as bigint[]).includes(badge.id)
                 ? "unclaimed"
                 : "pending",
        };
      });
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
    isPending: isStatePending || superChainBadges === undefined,
    badges: superChainBadges,
    isClaiming,
    claim,
  };
};
