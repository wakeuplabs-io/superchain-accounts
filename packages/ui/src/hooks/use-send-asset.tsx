import { Address, encodeFunctionData, erc20Abi } from "viem";
import { SuperChainUserOperation, useSuperChainAccount } from "./use-smart-account";
import { Asset } from "./use-assets";

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
  const { sendTransaction } = useSuperChainAccount();

  const sendAsset = async (asset:Asset, amount: bigint, to: Address) => {
    const userOperation = asset.native ? buildNativeTokenTransfer(to, amount) : buildERC20TokenTransfer(to, amount, asset);
    await sendTransaction(userOperation);
  };

  return {
    sendAsset
  };
}