// src/components/ui/ReceiveTokensDialog.tsx
import * as Dialog from "@radix-ui/react-dialog";
import { QRCodeSVG } from "qrcode.react";
import { ClipboardCopy } from "lucide-react";
import { SuperchainNetwork } from "@/types";

interface ReceiveTokensDialogProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  network: SuperchainNetwork;
}

export const ReceiveTokensDialog = ({
  isOpen,
  onClose,
  address,
  network,
}: ReceiveTokensDialogProps) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold">
            Receive tokens
          </Dialog.Title>

          <div className="flex flex-col items-center justify-center p-4">
            <div className="relative">
              <QRCodeSVG value={address} size={200} level="H" />
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full p-1"
                style={{ backgroundColor: network.color }}
              >
                <span className="text-white text-sm font-bold">
                  {network.symbol}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <span className="font-mono">{address}</span>
              <button
                onClick={() => navigator.clipboard.writeText(address)}
                className="rounded p-1 hover:bg-gray-100"
              >
                <ClipboardCopy size={16} />
              </button>
            </div>
          </div>

          <Dialog.Close className="absolute right-4 top-4 rounded p-1 hover:bg-gray-100">
            ✕
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
