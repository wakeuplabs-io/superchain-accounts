import { useWeb3 } from "./use-web3";
import { useSuperChainAccount } from "./use-smart-account";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pointsService } from "@/services";
import envParsed from "@/envParsed";
import superchainPoints from "@/config/abis/superchain-points";
import { encodeFunctionData, zeroAddress } from "viem";
import { ClaimPointsBody } from "schemas";
import { SuperchainPointEvent } from "@/services/points";

export const useSuperchainPoints = () => {
  const { chain } = useWeb3();
  const {
    account: { address },
    sendTransaction,
  } = useSuperChainAccount();
  const queryClient = useQueryClient();

  const { data, isPending: isStatePending } = useQuery({
    staleTime: 0,
    refetchOnMount: true,
    enabled: address != zeroAddress,
    queryKey: ["superchainPoints", address ?? "0x0", chain.id],
    queryFn: async () => {
      const points = await chain.client.readContract({
        address: envParsed().SUPERCHAIN_POINTS_ADDRESS as `0x${string}`,
        abi: superchainPoints,
        functionName: "balanceOf",
        args: [address],
      });

      const claimable = await chain.client.readContract({
        address: envParsed().SUPERCHAIN_POINTS_ADDRESS as `0x${string}`,
        abi: superchainPoints,
        functionName: "getClaimable",
        args: [address],
      });

      const events = await pointsService.getUserPoints(
        address,
        String(chain.id)
      );

      return {
        points: (points as bigint) ?? 0n,
        claimable: (claimable as bigint) ?? 0n,
        events,
      };
    },
  });

  const { mutateAsync: claimPoints, isPending: isClaimingPoints } = useMutation({
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
        queryKey: ["superchainPoints", address ?? "0x0", chain.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["superchainProfile"],
      });
    },
  });

  const {mutateAsync: setPointClaimed, isPending: isSettingPointsClaimed } = useMutation({
    mutationFn: async (request: ClaimPointsBody) => {
      return pointsService.claim(request);
    }
  });

  const claim = async (points: SuperchainPointEvent[]) => {
    return claimPoints()
      .then(() => setPointClaimed(points.map((point) => point.id)));
  };

  return {
    isPending: isStatePending || data === undefined,
    claimable: data?.claimable ?? 0n,
    events: data?.events ?? [],
    isClaiming: isClaimingPoints || isSettingPointsClaimed,
    points: data?.points ?? 0n,
    claim,
  };
};
