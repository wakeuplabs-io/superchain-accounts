import { QRCodeSVG } from "qrcode.react";
import { Copy } from "lucide-react";
import { useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { ChainMetadata } from "@/config/chains";
import { shortenAddress } from "@/lib/address";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface ReceiveTokensDialogProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  chain: ChainMetadata;
}

export const ReceiveTokensDialog = ({
  isOpen,
  onClose,
  address,
  chain,
}: ReceiveTokensDialogProps) => {
  const { toast } = useToast();
  const shortAddress = useMemo(() => shortenAddress(address), [address]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Receive Tokens</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col w-full items-center gap-12 justify-center pt-16 pb-8">
          <div className="relative">
            <QRCodeSVG value={address} size={200} level="L" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-[5px] border-white bg-white rounded-full shadow-md">
              <img className="w-14 h-14" src={chain.logo} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-3xl font-light">{shortAddress}</span>
              <span className="text-xs font-medium">Address</span>
            </div>
            <Copy
              className="w-8 h-8 cursor-pointer hover:text-gray-500"
              strokeWidth={2}
              onClick={() => {
                navigator.clipboard.writeText(address);
                toast({
                  title: "Address copied to clipboard",
                });
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
