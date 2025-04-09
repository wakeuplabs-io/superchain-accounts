import { ActionButton } from "./action-button";
import { Download } from "lucide-react";
import { useState } from "react";
import { ReceiveTokensDialog } from "@/components/_authenticated/smart-account-card/receive-tokens-dialog";
import { useWeb3 } from "@/hooks/use-web3";
import { useSuperChainAccount } from "@/hooks/use-smart-account";

export function SmartAccountCard() {
  const { chain } = useWeb3();
  const { account } = useSuperChainAccount();
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);

  if (account.status === "pending") return null;

  return (
    <>
      <div className="flex flex-col rounded-lg shadow-sm bg-white p-8 max-w-screen-xl gap-8">
        <div className="flex flex-row gap-4 items-center">
          <img className="w-16 h-16" src={chain.logo} />
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl text-black font-semibold">
              {chain.data.name}
            </h2>
            <span className="text-base text-black font-normal">
              Smart Account
            </span>
          </div>
        </div>
        <div className="flex items-start w-full">
          <ActionButton
            text="Receive"
            icon={Download}
            onClick={() => setIsReceiveDialogOpen(true)}
          />
        </div>
      </div>
      <ReceiveTokensDialog
        isOpen={isReceiveDialogOpen}
        onClose={() => setIsReceiveDialogOpen(false)}
        address={account.instance?.address}
        chain={chain}
      />
    </>
  );
}
