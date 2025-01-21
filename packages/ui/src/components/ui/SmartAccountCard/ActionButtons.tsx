// src/components/ui/ActionButtons.tsx
import { useState } from "react";
import { Send, Download, Import } from "lucide-react";
import { ReceiveTokensDialog } from "@/components/ui/SmartAccountCard/ReceiveTokensDialog";
import { ImportTokensDialog } from "@/components/ui/SmartAccountCard/ImportTokenDialog";
import { SuperchainNetwork } from "@/types";
import { Address } from "viem";

interface ActionButtonsProps {
  onSend?: () => void;
  network: SuperchainNetwork;
  address: Address;
}

export const ActionButtons = ({
  onSend,
  network,
  address,
}: ActionButtonsProps) => {
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  return (
    <>
      <div className="flex gap-4">
        <button
          onClick={onSend}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md hover:bg-gray-50 text-gray-700"
        >
          <Send className="w-4 h-4" />
          <span>Send</span>
        </button>

        <button
          onClick={() => setIsReceiveOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md hover:bg-gray-50 text-gray-700"
        >
          <Download className="w-4 h-4" />
          <span>Receive</span>
        </button>

        <button
          onClick={() => setIsImportOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md hover:bg-gray-50 text-gray-700"
        >
          <Import className="w-4 h-4" />
          <span>Import tokens</span>
        </button>
      </div>

      <ReceiveTokensDialog
        isOpen={isReceiveOpen}
        onClose={() => setIsReceiveOpen(false)}
        address={address}
        network={network}
      />

      <ImportTokensDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
    </>
  );
};
