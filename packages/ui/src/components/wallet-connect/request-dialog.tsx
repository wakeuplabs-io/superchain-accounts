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
import { hexToString } from "viem";

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

        <div className="overflow-y-auto pt-8 pb-12 text-sm">
          {type === "proposal" && (
            <div className="overflow-x-auto">
              <a
                target="_blank"
                href={data.proposal?.params.proposer.metadata.url}
                className="font-semibold text-primary underline"
              >
                {data.proposal?.params.proposer.metadata.name}
              </a>{" "}
              is trying to connect to chains{" "}
              {(data.proposal?.params.optionalNamespaces.eip155?.chains ?? [])
                .concat(
                  data.proposal?.params.requiredNamespaces.eip155?.chains ?? []
                )
                .join(", ")}
            </div>
          )}

          {type === "personal_sign" && (
            <div>
              <div className="text-xs mb-2">Message</div>
              <div className="border rounded-lg p-3 overflow-x-auto">
                <pre className="">
                  {hexToString(data.requestEvent?.params?.request?.params[0])}
                </pre>
              </div>
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

        <DialogFooter className="flex flex-col sm:flex-row-reverse sm:justify-start gap-2 w-full">
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
