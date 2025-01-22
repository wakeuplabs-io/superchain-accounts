// src/components/ui/smart-account/SendTokensDialog.tsx
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import qrIconPng from "@/assets/qr-scan.png";
import { SuperchainNetwork } from "@/types";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useState } from "react";

interface SendTokensDialogProps {
  isOpen: boolean;
  onClose: () => void;
  network: SuperchainNetwork;
  address: string;
}

export const SendTokensDialog = ({
  isOpen,
  onClose,
  network,
  address,
}: SendTokensDialogProps) => {
  const [toAddress, setToAddress] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  const shortAddress = address.slice(0, 10) + "..." + address.slice(-4);

  const handleQrScan = () => {
    setShowScanner(true);
    const scanner = new Html5QrcodeScanner("qr-reader", {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
    });

    scanner.render(
      (decodedText) => {
        setToAddress(decodedText);
        scanner.clear();
        setShowScanner(false);
      },
      (error) => {
        console.warn(error);
      }
    );
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] bg-white rounded-[20px] p-6">
          <div className="flex justify-between items-center mb-8">
            <Dialog.Title className="text-base font-medium">
              Send tokens
            </Dialog.Title>
            <Dialog.Close className="rounded-full hover:bg-gray-50">
              <X className="w-5 h-5 text-gray-400" />
            </Dialog.Close>
          </div>

          <form className="space-y-6">
            <div>
              <label className="text-sm text-gray-900">From</label>
              <div className="mt-2 flex items-center gap-2 p-2 border border-gray-200 rounded-lg">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: network.color }}
                >
                  <span className="text-white text-xs">{network.symbol}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{network.name}</span>
                  <span className="text-xs text-gray-500">{shortAddress}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-900">To</label>
              <div className="mt-2 relative">
                <input
                  type="text"
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  placeholder="Enter the public address (0x)"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 pr-20"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                  <button
                    type="button"
                    onClick={handleQrScan}
                    className="p-1 hover:bg-gray-50 rounded-full"
                  >
                    <img src={qrIconPng} alt="Scan QR" className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard
                        .readText()
                        .then((text) => setToAddress(text));
                    }}
                    className="p-1 hover:bg-gray-50 rounded-full"
                  >
                    <div className="w-5 h-5 text-[#FF0420]">📋</div>
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#FF0420] text-white rounded-full text-sm font-medium"
            >
              Continue
            </button>
          </form>

          {showScanner && (
            <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg w-[90%] max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Scan QR Code</h3>
                  <button
                    onClick={() => setShowScanner(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X />
                  </button>
                </div>
                <div id="qr-reader" className="w-full" />
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
