// src/components/ui/AccountBalance.tsx
import { SuperchainNetwork } from "@/types";
import { NetworkIcon } from "./NetworkIcon";

interface AccountBalanceProps {
  points: number;
  network: SuperchainNetwork;
}

export const AccountBalance = ({ points, network }: AccountBalanceProps) => (
  <div className="flex items-center gap-3">
    <NetworkIcon network={network} />
    <div className="flex flex-col">
      <span className="font-semibold text-gray-900">{network.name}</span>
      <span className="text-sm text-gray-500">Smart account</span>
    </div>
    <div className="ml-auto">
      <span className="text-3xl font-semibold">{points}</span>
      <div className="text-sm text-right text-gray-500">{points}</div>
    </div>
  </div>
);
