import { useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Asset, useAssets } from "@/hooks/use-assets";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { SendAssetType } from "@/hooks/use-send-asset";

function computeAmount(amount: string, asset: Asset): bigint {
  const bn = new BigNumber(amount || "0").multipliedBy(
    new BigNumber(10).pow(asset.decimals)
  );
  if (!bn.isInteger()) return 0n; // should be fixed point
  return BigInt(bn.toFixed(0));
}

const AmountField = () => {
  const { control, setValue, watch} = useFormContext<SendAssetType>();
  const {isPending, error, data} = useAssets();
  const [controlledValue, setControlledValue] = useState<string>("0");
  const [currentAsset, setCurrentAsset] = useState<Asset | null>(null);
  
  const selectedAsset = watch("asset");

  useEffect(() => {
    if(isPending || error) return;

    const asset = data.find((asset) => asset.symbol === selectedAsset);
    
    if(!asset) {
      throw new Error("Asset not found"); 
    }

    setCurrentAsset(asset);
    setControlledValue("0");
    setValue("amount", 0n);
  }, [selectedAsset]);

  return  (
    <FormField
      control={control}
      name="amount"
      render={({field}) => {
        return (
          <FormItem>
            <FormLabel>Amount</FormLabel>
            <FormControl>
              <Input {...field} type="number" value={controlledValue} onChange={(e: React.ChangeEvent<HTMLInputElement>)=> {
                const val = e.target.value;

                if(!currentAsset) return;

                // Validate decimal places
                const [, fraction] = val.split(".");

                if (fraction && fraction.length > currentAsset.decimals) return; // Too many decimals

                setControlledValue(val);

                const newAmount = computeAmount(val, currentAsset);
                field.onChange(newAmount);
              }} />
            </FormControl>
            <FormMessage />
          </FormItem>
        );}}
    />
  );
};

export default AmountField;
