import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { isAddress } from "viem";
import { z } from "zod";
import { useSuperChainAccount } from "./use-smart-account";
import { useAssets } from "./use-assets";
import BigNumber from "bignumber.js";

const sendAssetSchema = z.object({
  address: z.string().min(1, "Address is required"),
  asset: z.string().min(1, "Asset is required"),
  amount: z.bigint().refine((val) => val > 0n, {
    message: "Amount must be greater than 0",
  }),
  destinationAddress: z.string({
    required_error: "Destination address is required",
  }).refine(
    (val) => {
      try {
        return isAddress(val);
      } catch (error) {
        return false;
      }
    },
    {
      message: "Invalid address",
    }
  ),
});

export type SendAssetType = z.infer<typeof sendAssetSchema>;

export function useSendAsset() {
  const { account } = useSuperChainAccount();
  const { isPending, error, data: assetsData } = useAssets();

  const form = useForm({
    resolver: zodResolver(sendAssetSchema),
    defaultValues: {
      address: account.address,
    }
  });

  const onSubmit = async (data: SendAssetType) => {
    console.log(data);
    if(isPending || error) return;

    if(data.address === data.destinationAddress) {
      form.setError("destinationAddress", {
        message: "Destination address cannot be the same as the sender address",
      });
    }

    const asset = assetsData?.find((asset) => asset.symbol === data.asset);

    if(!asset) {
      return;
    }

    if(asset.balance < data.amount) {
      form.setError("amount", {
        message: "Insufficient balance",
      });
    }


    if(!form.formState.isValid) return;

    console.log(data);
  };

  return {
    form,
    onSubmit,
  };
}