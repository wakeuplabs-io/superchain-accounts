import * as Dialog from "@radix-ui/react-dialog";
import { QRCodeSVG } from "qrcode.react";
import { Copy } from "lucide-react";
import { useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { ChainMetadata } from "@/config/chains";
import { shortenAddress } from "@/lib/address";

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
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-10" />
        <Dialog.Content className="fixed w-full h-full left-0 top-0 md:h-auto md:max-w-lg md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 rounded-lg bg-white  pt-12 pb-20 px-12 shadow-lg z-20">
          <Dialog.Title className="flex justify-between items-center mb-16">
            <span className="text-base font-medium">Receive Tokens</span>
            <Dialog.Close className="hover:bg-gray-100 text-lg">✕</Dialog.Close>
          </Dialog.Title>
          <div className="flex flex-col w-full items-center gap-12 justify-center ">
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
