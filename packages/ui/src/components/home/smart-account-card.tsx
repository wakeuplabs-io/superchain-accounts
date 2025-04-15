import { ArrowRightLeft, CloudDownload, Download, Send } from "lucide-react";
import { useState } from "react";
import { ReceiveTokensDialog } from "@/components/home/receive-tokens-dialog";
import { useWeb3 } from "@/hooks/use-web3";
import { useSuperChainAccount } from "@/hooks/use-smart-account";
import { ImportTokensDialog } from "./import-token-dialog";
import { Button } from "../ui";
import { SwapTokenDialog } from "../swap-tokens";
import { SendAssetDialog } from "./send-asset-dialog/send-asset-dialog";

export function SmartAccountCard() {
  const { chain } = useWeb3();
  const { account } = useSuperChainAccount();
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);

  if (account.status === "pending") return null;

  return (
    <>
      <div className="flex flex-col rounded-lg border bg-white p-8 max-w-screen-xl gap-8">
        <div className="flex flex-wrap flex-row gap-4 items-center">
          <img className="w-16 h-16" src={chain.logo} />
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl text-black font-semibold">{chain.name}</h2>
            <span className="text-base text-black font-normal">
              Smart Account
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-start gap-4 w-full">
          <Button className="gap-2 px-6 group" size="lg" variant="outline" onClick={() => setIsSendDialogOpen(true)}>
            <Send className="w-5 h-5 group-hover:text-primary" />
            <span className="text-base">Send</span>
          </Button>
          <Button className="gap-2 px-6 group" size="lg" variant="outline" onClick={() => setIsReceiveDialogOpen(true)}>
            <Download className="w-5 h-5 group-hover:text-primary" />
            <span className="text-base">Receive</span>
          </Button>
          <Button className="gap-2 px-6 group" size="lg" variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            <CloudDownload className="w-5 h-5 group-hover:text-primary" />
            <span className="text-base">Import Tokens</span>
          </Button>

          <SwapTokenDialog>
            <Button
              size="lg"
              className="gap-2 px-6"
              variant="outline"
            >
              <ArrowRightLeft className="w-5 h-5" />
              <span className="text-base">Swap</span>
            </Button>
          </SwapTokenDialog>
        </div>
      </div>

      {/* TODO: refactor to use shadcn dialog like swap */}
      
      {isSendDialogOpen && 
        <SendAssetDialog 
          isOpen={isSendDialogOpen} 
          onClose={() => setIsSendDialogOpen(false)}
        />
      }
      {isReceiveDialogOpen && (
        <ReceiveTokensDialog
          isOpen={isReceiveDialogOpen}
          onClose={() => setIsReceiveDialogOpen(false)}
          address={account.instance?.address ?? ""}
          chain={chain}
        />
      )}
      {isImportDialogOpen && (
        <ImportTokensDialog
          isOpen={isImportDialogOpen}
          onClose={() => setIsImportDialogOpen(false)}
        />
      )}
    </>
  );
}
