import React from "react";
import { Send, Download, Import } from "lucide-react";

interface OptimismAccountCardProps {
  balance?: string;
  onSend?: () => void;
  onReceive?: () => void;
  onImport?: () => void;
}

const OptimismAccountCard = ({
  balance = "1000",
  onSend,
  onReceive,
  onImport,
}: OptimismAccountCardProps) => {
  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">OP</span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">OPTIMISM</span>
          <span className="text-sm text-gray-500">Smart account</span>
        </div>
        <div className="ml-auto">
          <span className="text-3xl font-semibold">{balance}</span>
          <div className="text-sm text-right text-gray-500">{balance}</div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onSend}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md hover:bg-gray-50 text-gray-700"
        >
          <Send className="w-4 h-4" />
          <span>Send</span>
        </button>

        <button
          onClick={onReceive}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md hover:bg-gray-50 text-gray-700"
        >
          <Download className="w-4 h-4" />
          <span>Receive</span>
        </button>

        <button
          onClick={onImport}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md hover:bg-gray-50 text-gray-700"
        >
          <Import className="w-4 h-4" />
          <span>Import tokens</span>
        </button>
      </div>
    </div>
  );
};

export default OptimismAccountCard;
