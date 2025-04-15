import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import defaultTokenLogo from "@/assets/logos/default-token-logo.png";
import { formatUnits } from "viem";
import { SelectProps } from "@radix-ui/react-select";
import { Asset } from "@/hooks/use-assets";

export const AssetSelector = ({
  assets,
  ...props
}: SelectProps & { assets: Asset[] }) => {
  return (
    <Select {...props}>
      <SelectTrigger className="h-12 focus:ring-0">
        <SelectValue placeholder="Select a token" />
      </SelectTrigger>
      <SelectContent>
        {assets?.map((asset) => {
          return (
            <SelectItem key={asset.symbol} value={asset.address!}>
              <div className="flex items-center gap-x-2 w-full">
                <div className="rounded-full bg-gray-100 flex items-center justify-center">
                  <img
                    src={asset.logoURI ?? defaultTokenLogo}
                    alt={asset.name}
                    className="w-8 h-8"
                  />
                </div>
                <div className="flex flex-col gap-0 items-start">
                  <span className="text-base font-normal text-black">
                    {asset.symbol}
                  </span>
                  <span className="text-xs font-normal text-gray-500">
                    {formatUnits(asset.balance, asset.decimals)}
                  </span>
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};
