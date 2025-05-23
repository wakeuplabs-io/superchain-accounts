import { userService } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { useSuperChainAccount } from "./use-smart-account";
import { Profile } from "schemas";

const defaultProfile: Profile = {
  points: 0,
  rank: "",
  position: {
    current: 0,
    total: 100,
    percentile: 100,
  }
};

export function useSuperchainProfile() {
  const { account } = useSuperChainAccount();

  const { data: profile, isPending, error } = useQuery({
    queryKey: ["superchainProfile"],
    queryFn: async () => userService.getProfile(account.address),
    staleTime: 0,
    refetchOnMount: true,
    enabled: account.status !== "pending"
  });

  return { profile: profile ?? defaultProfile, isPending, error };
}