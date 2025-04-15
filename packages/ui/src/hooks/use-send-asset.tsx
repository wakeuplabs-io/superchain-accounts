import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Address, encodeFunctionData, erc20Abi, getAddress, isAddress } from "viem";
import { z } from "zod";
import { SuperChainUserOperation, useSuperChainAccount } from "./use-smart-account";
import { Asset, useAssets } from "./use-assets";
import { useToast } from "./use-toast";

const sendAssetSchema = z.object({
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
  ).transform(val => getAddress(val)),
});

export type SendAssetType = z.infer<typeof sendAssetSchema>;

function buildNativeTokenTransfer(to: Address, amount: bigint): SuperChainUserOperation {
  return {
    to,
    value: amount,
  };
}

function buildERC20TokenTransfer(to: Address, amount: bigint, asset: Asset): SuperChainUserOperation {
  if(!asset.address) {
    throw new Error("Asset has no address");
  }

  const transferData = encodeFunctionData({
    abi: erc20Abi,
    functionName: "transfer",
    args: [to, amount],
  });


  return {
    to: asset.address,
    value: 0n,
    data: transferData,
  };
}

export function useSendAsset() {
  const { account, sendTransaction } = useSuperChainAccount();
  const { isPending, error, data: assetsData, invalidateAssetData } = useAssets();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(sendAssetSchema),
  });

  const onSubmit = async (data: SendAssetType) => {
    if(isPending || error) return;

    if(account.address === data.destinationAddress) {
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


    if(Object.keys(form.formState.errors).length > 0) return;

    try {
      const userOperation = asset.native ? buildNativeTokenTransfer(data.destinationAddress, data.amount) : buildERC20TokenTransfer(data.destinationAddress, data.amount, asset);
      
      await sendTransaction(userOperation);

      invalidateAssetData(asset);

      toast({
        title: "Transaction successfully sent",
      });
    } catch (error) {
      let description = "Something went wrong";
      if(error instanceof Error) {
        description = error.message;
      }

      toast({
        title: "Error sending asset",
        variant: "destructive",
        description,
      });
    }
  };

  return {
    form,
    onSubmit,
  };
}