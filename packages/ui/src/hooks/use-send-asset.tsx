import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { isAddress } from "viem";
import { z } from "zod";
import { useSuperChainAccount } from "./use-smart-account";

const sendAssetSchema = z.object({
  address: z.string().min(1, "Address is required"),
  asset: z.string().min(1, "Asset is required"),
  amount: z.bigint(),
  destinationAddress: z.string().min(1, "Address is required").refine(
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

  const form = useForm({
    resolver: zodResolver(sendAssetSchema),
    defaultValues: {
      address: account.address,
    }
  });

  const onSubmit = (data: SendAssetType) => {
    if(data.address === data.destinationAddress) {
      form.setError("destinationAddress", {
        message: "Destination address cannot be the same as the sender address",
      });
      return;
    }

    console.log(data);
  };

  return {
    form,
    onSubmit,
  };
}