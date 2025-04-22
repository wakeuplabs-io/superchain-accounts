import { userService } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { useSuperChainAccount } from "./use-smart-account";
import { Profile } from "schemas";

const defaultProfile: Profile = {
  position: {
    current: 0,
    total: 100,
  }
};

export function useSuperchainProfile() {
  const { account } = useSuperChainAccount();

  const { data: profile, isPending, error } = useQuery({
    queryKey: ["superchain-profile"],
    queryFn: async () => userService.getProfile(account.address),
    staleTime: 0,
    refetchOnMount: true,
    enabled: account.status !== "pending"
  });

  return { profile: profile ?? defaultProfile, isPending, error };
}