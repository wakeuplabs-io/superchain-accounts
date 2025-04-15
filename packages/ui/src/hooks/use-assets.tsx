import { Address, zeroAddress } from "viem";
import { GetUserTokensResponse } from "schemas";
import { useAccountBalance } from "@/hooks/use-account-balance";
import { useUserTokens } from "@/hooks/use-user-tokens";
import { useWeb3 } from "@/hooks/use-web3";
import ethLogo from "@/assets/logos/eth-logo.svg";

export type Asset = Pick<
  GetUserTokensResponse[number],
  "name" | "symbol" | "decimals" | "balance" | "logoURI"
> & {
  native: boolean;
  address: Address;
};

type UseAssetsResult = {
  isPending: boolean;
  data: Asset[];
  error?: Error | null;
  invalidateAssetData: (asset: Asset) => void;
};

export function useAssets(): UseAssetsResult {
  const { chain } = useWeb3();
  const {
    status: accountBalanceStatus,
    data: accountBalance,
    error: accountBalanceError,
    invalidateAccountBalance,
  } = useAccountBalance();
  const {
    status: userTokensStatus,
    data: userTokens,
    error: userTokensError,
    invalidateUserTokens,
  } = useUserTokens();

  const invalidateAssetData = (asset: Asset) => {
    if (asset.native) {
      invalidateAccountBalance();
    } else {
      invalidateUserTokens();
    }
  };

  if (accountBalanceStatus === "pending" || userTokensStatus === "pending") {
    return { isPending: true, data: [], error: null, invalidateAssetData };
  }

  if (accountBalanceStatus === "error" || userTokensStatus === "error") {
    return {
      isPending: false,
      error: accountBalanceError ?? userTokensError,
      data: [],
      invalidateAssetData,
    };
  }

  const nativeAsset: Asset = {
    ...chain.nativeCurrency,
    balance: accountBalance,
    address: zeroAddress,
    logoURI: ethLogo,
    native: true,
  };

  return {
    isPending: false,
    data: [nativeAsset, ...userTokens.map((token) => ({ ...token, native: false }))],
    invalidateAssetData,
  };
}
