import { useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Asset, useAssets } from "@/hooks/use-assets";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { formatUnits } from "viem";
import { SendAssetType } from "./send-asset-dialog";

function computeAmount(amount: string, asset: Asset): bigint {
  const bn = new BigNumber(amount || "0").multipliedBy(
    new BigNumber(10).pow(asset.decimals)
  );
  if (!bn.isInteger()) return 0n; // should be fixed point
  return BigInt(bn.toFixed(0));
}

const AmountField = () => {
  const { control, setValue, watch } = useFormContext<SendAssetType>();
  const {isPending, error, data: assets} = useAssets();
  const [controlledValue, setControlledValue] = useState<string>("0");
  const [currentAsset, setCurrentAsset] = useState<Asset | null>(null);
  
  const selectedAsset = watch("asset");

  useEffect(() => {
    if(isPending || error) return;

    const asset = assets.find((asset) => asset.address === selectedAsset);
    
    if(!asset) return;

    setCurrentAsset(asset);
    setControlledValue("0");
    setValue("amount", 0n);
  }, [selectedAsset]);

  const setMaxValue = () => {
    if(!currentAsset) return;

    const formattedBalance = formatUnits(currentAsset.balance, currentAsset.decimals);
    setControlledValue(formattedBalance);
    setValue("amount", currentAsset.balance, {shouldValidate: true});
  };

  return  (
    <FormField
      control={control}
      name="amount"
      render={({field}) => {
        return (
          <FormItem>
            <FormLabel>Amount</FormLabel>
            <FormControl>
              <div className="flex items-center border gap-1 border-input pr-2 rounded-md group focus-within:ring-offset-2 focus-within:ring-2 focus-within:ring-black">
                <Input className="border-0 w-[90%] ring-0 focus-visible:ring-offset-0 focus-visible:ring-0" {...field} type="number" value={controlledValue} onChange={(e: React.ChangeEvent<HTMLInputElement>)=> {
                  const val = e.target.value;

                  if(!currentAsset) return;

                  // Validate decimal places
                  const [, fraction] = val.split(".");

                  if (fraction && fraction.length > currentAsset.decimals) return; // Too many decimals

                  setControlledValue(val);

                  const newAmount = computeAmount(val, currentAsset);
                  field.onChange(newAmount);
                }} />
                <a onClick={setMaxValue} className="text-xs text-primary font-medium cursor-pointer">MAX</a>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );}}
    />
  );
};

export default AmountField;
