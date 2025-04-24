import { formatUnits } from "viem";
import defaultTokenLogo from "@/assets/logos/default-token-logo.png";
import { Asset } from "@/hooks/use-assets";

interface AssetListItemProps {
  asset: Asset;
}

export function AssetListItem({ asset }: AssetListItemProps) {
  return (
    <li className="flex flex-wrap items-center justify-between py-6">
      <div className="flex items-center gap-4">
        <img
          className="w-10 h-10 rounded-full"
          src={asset.logoURI ?? defaultTokenLogo}
          alt={asset.name}
        />
        <span className="text-base font-semibold">{asset.symbol}</span>
      </div>
      <span className="text-sm font-semibold">
        {Number(formatUnits(asset.balance, asset.decimals)).toFixed(4)}
      </span>
    </li>
  );
}
