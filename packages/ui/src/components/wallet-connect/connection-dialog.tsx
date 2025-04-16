import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConnectionDialog } from "@/hooks/use-connection-dialog";
import { DialogType } from "@/lib/wallet-connect";
import { formatUnits } from "viem";
import { useState } from "react";
import { useWalletConnect } from "@/hooks/use-wallet-connect";

interface ConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: DialogType;
}

export function ConnectionDialog({
  open,
  onOpenChange,
  type,
}: ConnectionDialogProps) {
  const [isAccepting, setIsAccepting] = useState(false);

  const {
    handleApproveProposal,
    handleRejectProposal,
    handleRejectRequest,
    handleApproveSignRequest,
  } = useConnectionDialog(onOpenChange);

  const { data } = useWalletConnect();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {type === "proposal"
              ? "Approve Connection"
              : type === "eth_sendTransaction"
                ? "Approve Transaction"
                : "Sign Message"}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[200px] overflow-y-auto">
          <p className="break-words whitespace-pre-wrap overflow-hidden text-wrap text-muted-foreground">
            {type === "proposal"
              ? "Do you want to approve this connection request?"
              : type === "eth_sendTransaction"
                ? "Do you want to approve this transaction?"
                : `Do you want to sign the message?`}
          </p>
          {type === "eth_sendTransaction" && (
            <div className="mt-4 space-y-2 border rounded-lg p-3">
              <h3 className="font-semibold">Send transaction</h3>
              <div className="space-y-1">
                {JSON.stringify(data.requestEvent?.params)}
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 w-full">
          <Button
            variant="destructive"
            onClick={() => {
              if (type === "proposal") {
                handleRejectProposal();
              } else {
                handleRejectRequest();
              }
            }}
            className="flex-1"
            disabled={isAccepting}
          >
            Reject
          </Button>
          <Button
            onClick={async () => {
              setIsAccepting(true);
              try {
                if (type === "proposal") {
                  await handleApproveProposal();
                } else {
                  await handleApproveSignRequest();
                }
              } finally {
                setIsAccepting(false);
              }
            }}
            className="flex-1"
            disabled={isAccepting}
          >
            {isAccepting ? "Accepting..." : "Accept"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
