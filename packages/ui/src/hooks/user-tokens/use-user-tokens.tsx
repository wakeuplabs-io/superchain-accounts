import { useQuery } from "@tanstack/react-query";
import { useWeb3 } from "../use-web3";
import { useSuperChainAccount } from "../use-smart-account";
import { userService } from "@/services";

export function useUserTokens() {
  const {chain} = useWeb3();
  const {account} = useSuperChainAccount();
  
  return useQuery({
    queryKey: ["user-tokens", account.address, chain.id],
    queryFn: () => userService.getUserTokens({userWallet: account.address, chainId: chain.id}),
    enabled: account.status !== "pending",
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
}
