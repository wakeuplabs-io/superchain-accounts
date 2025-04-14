import { formatUnits } from "viem";
import defaultTokenLogo from "@/assets/logos/default-token-logo.png";
import { Asset } from "@/hooks/use-assets";

interface AssetListItemProps {
  token: Asset;
}

export function AssetListItem({ token }: AssetListItemProps){
  return (
    <li className="flex flex-wrap items-center justify-between border-t border-b py-6">
      <div className="flex items-center gap-4">
        <img className="w-10 h-10 rounded-full" src={token.logoURI ?? defaultTokenLogo} alt={token.name} />
        <span className="text-base font-semibold">{token.symbol}</span>
      </div>
      <span className="text-sm font-semibold">{formatUnits(token.balance, token.decimals)}</span>
    </li>
  );
}
