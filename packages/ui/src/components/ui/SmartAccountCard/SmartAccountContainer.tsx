// src/components/ui/SuperchainCard.tsx
import { SuperchainNetwork } from "@/types";
import { NetworkSelector } from "./NetworkSelector";
import { AccountBalance } from "./AccountBalance";
import { ActionButtons } from "./ActionButtons";
import { Address } from "viem";

interface SmartAccountCardProps {
  address: Address;
  points: number;
  currentNetwork: SuperchainNetwork;
  networks: SuperchainNetwork[];
  onNetworkSelect: (networkId: number) => void;
}

export const SmartAccountCard = ({
  address,
  points,
  currentNetwork,
  networks,
  onNetworkSelect,
}: SmartAccountCardProps) => (
  <div className="w-full">
    <NetworkSelector
      networks={networks}
      currentNetwork={currentNetwork}
      onNetworkSelect={onNetworkSelect}
    />

    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="mb-6">
        <AccountBalance points={points} network={currentNetwork} />
      </div>
      <ActionButtons network={currentNetwork} address={address} />
    </div>
  </div>
);
