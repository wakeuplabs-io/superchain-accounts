import { cn } from "@/lib/utils";
import { SuperchainNetwork } from "@/types";

interface NetworkSelectorProps {
  networks: SuperchainNetwork[];
  currentNetwork: SuperchainNetwork;
  onNetworkSelect: (networkId: number) => void;
}

// TODO: use classNames (cn) for conditionally applying classes.
// TODO: tailwind does not work well with conditionally applying classes without cn.

export const NetworkSelector = ({
  networks,
  currentNetwork,
  onNetworkSelect,
}: NetworkSelectorProps) => (
  <div className="mb-4 flex gap-2 overflow-x-auto">
    {networks.map((network) => (
      <button
        key={network.id}
        onClick={() => onNetworkSelect(network.id)}
        className={cn("flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2", {
          "bg-white shadow-sm": network.id === currentNetwork.id,
          "text-gray-600 hover:bg-gray-50": network.id !== currentNetwork.id
        })}
      >
        <div
          className={`h-2 w-2 rounded-full ${
            network.isConnected ? "bg-green-500" : "bg-gray-300"
          }`} // TODO: apply same here
        />
        <span>{network.name}</span>
        <span className="text-sm text-gray-500">
          {network.isConnected ? "Connected" : "Connect Smart Account"}
        </span>
      </button>
    ))}
  </div>
);
