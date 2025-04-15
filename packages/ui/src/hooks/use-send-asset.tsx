import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Address, encodeFunctionData, erc20Abi, getAddress, isAddress, zeroAddress } from "viem";
import { z } from "zod";
import { SuperChainUserOperation, useSuperChainAccount } from "./use-smart-account";
import { Asset, useAssets } from "./use-assets";
import { useToast } from "./use-toast";

const sendAssetSchema = z.object({
  asset: z.string({required_error: "Asset is required"}).transform(val => getAddress(val)),
  amount: z.bigint().refine((val) => val > 0n, {
    message: "Amount must be greater than 0",
  }),
  to: z.string({
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

export function getAssetByAddress(address: Address, assets: Asset[]): Asset | undefined {
  return address === zeroAddress ? assets.find((asset) => asset.native) : assets.find((asset) => asset.address === address);
}

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

  const onSubmit = async (data: SendAssetType): Promise<{validationError: boolean}> => {
    if(isPending || error) return {validationError: false};

    const validationErrors: {key: keyof typeof form.formState.errors; message: string}[] = [];
    
    if(account.address === data.to) {
      form.setError("to", {
        message: "Destination address cannot be the same as the sender address",
      });
    }

    const asset = getAssetByAddress(data.asset, assetsData);

    if(asset && asset.balance < data.amount) {
      validationErrors.push({
        key: "amount",
        message: "Insufficient balance",
      });
    }

    if(validationErrors.length > 0) {
      validationErrors.forEach((error) => {
        form.setError(error.key, {
          message: error.message,
        });
      });
      return {validationError: true};
    }

    try {
      if(!asset) {
        throw new Error("Asset not found");
      }

      const userOperation = asset.native ? buildNativeTokenTransfer(data.to, data.amount) : buildERC20TokenTransfer(data.to, data.amount, asset);
      
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

    return {validationError: false};
  };

  return {
    form,
    onSubmit,
  };
}