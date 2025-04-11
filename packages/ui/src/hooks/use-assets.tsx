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
   status: "pending",
   data: null,
} | {
    status: "success",
    data: Asset[],
} | {
    status: "error",
    error: Error | null,
    data: null,
}

export function useAssets(): UseAssetsResult {
  const { chain } = useWeb3();
  const { status: accountBalanceStatus, data: accountBalance, error: accountBalanceError } = useAccountBalance();
  const { status: userTokensStatus, data: userTokens, error: userTokensError } = useUserTokens();

  if (accountBalanceStatus === "pending" || userTokensStatus === "pending") {
    return { status: "pending", data: null };
  }

  if (accountBalanceStatus === "error" || userTokensStatus === "error") {
    return { status: "error", error: accountBalanceError ?? userTokensError, data: null  };
  }

  const nativeAsset: Asset = {
    ...chain.nativeCurrency,
    balance: accountBalance,
    logoURI: ethLogo,
    native: true,
  };

  return { 
    status: "success", 
    data: [
      nativeAsset,
      ...userTokens,
    ] 
  };
}
