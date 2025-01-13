import { SuperchainNetwork } from "@/types";

interface NetworkSelectorProps {
  networks: SuperchainNetwork[];
  currentNetwork: SuperchainNetwork;
  onNetworkSelect: (networkId: number) => void;
}

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
        className={`
         flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2
         ${
           network.id === currentNetwork.id
             ? "bg-white shadow-sm"
             : "text-gray-600 hover:bg-gray-50"
         }
       `}
      >
        <div
          className={`h-2 w-2 rounded-full ${
            network.isConnected ? "bg-green-500" : "bg-gray-300"
          }`}
        />
        <span>{network.name}</span>
        <span className="text-sm text-gray-500">
          {network.isConnected ? "Connected" : "Connect Smart Account"}
        </span>
      </button>
    ))}
  </div>
);
