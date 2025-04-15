import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAssets } from "@/hooks/use-assets";
import { useFormContext } from "react-hook-form";

import defaultTokenLogo from "@/assets/logos/default-token-logo.png";
import { formatUnits } from "viem";
import { useMemo } from "react";

const AssetSelector = () => {
  const {control} = useFormContext();
  const {isPending, error, data} = useAssets();

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const defaultAsset = useMemo(() => {
    return data?.find((asset) => !!asset.native) ?? data[0];
  }, [data]);
  
  return (
    <FormField
      control={control}
      name="asset"
      defaultValue={defaultAsset?.symbol}
      render={({field}) => {
        return (
          <FormItem>
            <FormLabel>Asset</FormLabel>
            <FormControl>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <SelectTrigger className="h-12 focus:ring-0">
                  <SelectValue placeholder="Select a token" />
                </SelectTrigger>
                <SelectContent>
                  {data?.map((asset) => {
                    return (
                      <SelectItem key={asset.symbol} value={asset.symbol}>
                        <div className="flex items-center gap-x-2">
                          <div className="rounded-full bg-gray-100 flex items-center justify-center">
                            <img src={asset.logoURI ?? defaultTokenLogo} alt={asset.name} className="w-8 h-8" />
                          </div>
                          <div className="flex flex-col gap-0 items-start">
                            <span className="text-base font-normal text-black">{asset.symbol}</span>
                            <span className="text-xs font-normal text-gray-500">{formatUnits(asset.balance, asset.decimals)}</span>
                          </div>
                        </div>
                      </SelectItem>
                    );  
                  })}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default AssetSelector;
