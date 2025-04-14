import { Address } from "viem";
import { GetUserTokensResponse } from "schemas";
import { useAccountBalance } from "@/hooks/use-account-balance";
import { useUserTokens } from "@/hooks/use-user-tokens";
import { useWeb3 } from "@/hooks/use-web3";
import ethLogo from "@/assets/logos/eth-logo.svg";

export type Asset = Pick<GetUserTokensResponse[number], "name" | "symbol" | "decimals" | "balance" | "logoURI"> & {
  native?: boolean,
  address?: Address,
}

type UseAssetsResult = {
   isPending: true
   data: null,
   error: null
} | {
  isPending: false,
  error?: Error | null,
  data: Asset[],
};

export function useAssets(): UseAssetsResult {
  const { chain } = useWeb3();
  const { status: accountBalanceStatus, data: accountBalance, error: accountBalanceError } = useAccountBalance();
  const { status: userTokensStatus, data: userTokens, error: userTokensError } = useUserTokens();

  if (accountBalanceStatus === "pending" || userTokensStatus === "pending") {
    return { isPending: true, data: null, error: null };
  }

  if (accountBalanceStatus === "error" || userTokensStatus === "error") {
    return { isPending: false, error: accountBalanceError ?? userTokensError, data: []  };
  }

  const nativeAsset: Asset = {
    ...chain.nativeCurrency,
    balance: accountBalance,
    logoURI: ethLogo,
    native: true,
  };

  return {
    isPending: false,
    data: [
      nativeAsset,
      ...userTokens,
    ] 
  };
}
