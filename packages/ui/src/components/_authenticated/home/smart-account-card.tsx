import { ActionButton } from "./action-button";
import { CloudDownload, Download } from "lucide-react";
import { useState } from "react";
import { ReceiveTokensDialog } from "@/components/_authenticated/home/receive-tokens-dialog";
import { useWeb3 } from "@/hooks/use-web3";
import { useSuperChainAccount } from "@/hooks/use-smart-account";
import { ImportTokensDialog } from "./import-token-dialog";

export function SmartAccountCard() {
  const { chain } = useWeb3();
  const { account } = useSuperChainAccount();
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  if (account.status === "pending") return null;

  return (
    <>
      <div className="flex flex-col rounded-lg shadow-sm bg-white p-8 max-w-screen-xl gap-8">
        <div className="flex flex-row gap-4 items-center">
          <img className="w-16 h-16" src={chain.logo} />
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl text-black font-semibold">
              {chain.name}
            </h2>
            <span className="text-base text-black font-normal">
              Smart Account
            </span>
          </div>
        </div>
        <div className="flex items-start gap-4 w-full">
          <ActionButton
            text="Receive"
            icon={Download}
            onClick={() => setIsReceiveDialogOpen(true)}
          />
          <ActionButton 
            text='Import tokens' 
            icon={CloudDownload} 
            onClick={() => setIsImportDialogOpen(true)} 
          />
        </div>
      </div>
      {isReceiveDialogOpen && <ReceiveTokensDialog
        isOpen={isReceiveDialogOpen}
        onClose={() => setIsReceiveDialogOpen(false)}
        address={account.instance?.address ?? ""}
        chain={chain}
      />}
      {isImportDialogOpen && <ImportTokensDialog
        isOpen={isImportDialogOpen}
        onClose={()=>setIsImportDialogOpen(false)}
      />}
    </>
  );
}
