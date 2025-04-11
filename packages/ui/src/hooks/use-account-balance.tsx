import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWeb3 } from "@/hooks/use-web3";
import { useSuperChainAccount } from "@/hooks/use-smart-account";
import { zeroAddress } from "viem";

export function useAccountBalance() {
  const {chain} = useWeb3();
  const {account} = useSuperChainAccount();
  const queryClient = useQueryClient();
  const queryKey = ["account-balance", account.address, chain.id];

  const invalidateAccountBalance = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    ...useQuery({
      queryKey,
      queryFn: () => chain.client.getBalance({
        address: account.address,
      }),
      enabled: account.status !== "pending" && account.address !== zeroAddress,
      refetchInterval: 1000 * 10, // refetch every 10 seconds
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    }),
    invalidateAccountBalance,
  };
}
