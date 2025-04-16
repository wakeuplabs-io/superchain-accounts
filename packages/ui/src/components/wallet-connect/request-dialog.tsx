import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWalletConnect } from "@/hooks/use-wallet-connect";
import { DialogType } from "@/lib/wallet-connect";
import { useState } from "react";

interface RequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: DialogType;
}

export function RequestDialog({
  open,
  onOpenChange,
  type,
}: RequestDialogProps) {
  const [isAccepting, setIsAccepting] = useState(false);

  const {
    data,
    handleApproveProposal,
    handleRejectProposal,
    handleRejectRequest,
    handleApproveSignRequest,
  } = useWalletConnect();

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
        <div className=" overflow-y-auto">
          {type === "personal_sign" && (
            <div className="border rounded-lg p-3 overflow-x-auto">
              <pre className="">
                {JSON.stringify(data.requestEvent?.params, null, 2)}
              </pre>
            </div>
          )}

          {type === "eth_sendTransaction" && (
            <div className="border rounded-lg p-3 ">
              <pre className="whitespace-pre-wrap break-words">
                {JSON.stringify(data.requestEvent?.params, null, 2)}
              </pre>
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 w-full">
          <Button
            onClick={async () => {
              setIsAccepting(true);
              try {
                if (type === "proposal") {
                  await handleApproveProposal().then(() => onOpenChange(false));
                } else {
                  await handleApproveSignRequest().then(() =>
                    onOpenChange(false)
                  );
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
          <Button
            variant="secondary"
            onClick={() => {
              if (type === "proposal") {
                handleRejectProposal().then(() => onOpenChange(false));
              } else {
                handleRejectRequest().then(() => onOpenChange(false));
              }
            }}
            className="flex-1"
            disabled={isAccepting}
          >
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
