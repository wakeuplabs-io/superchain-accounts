import { type Chain } from "viem/chains";

export interface SuperchainNetwork extends Chain {
  isConnected?: boolean;
  symbol: string;
  color: string;
}

export interface NetworkSelectorProps {
  networks: SuperchainNetwork[];
  currentNetwork: SuperchainNetwork;
  onNetworkSelect: (networkId: number) => void;
}

export interface NetworkIconProps {
  network: SuperchainNetwork;
  className?: string;
}

export interface AccountBalanceProps {
  balance: string;
  network: SuperchainNetwork;
}

export interface ActionButtonsProps {
  onSend?: () => void;
  onReceive?: () => void;
  onImport?: () => void;
}

export interface SuperchainCardProps extends ActionButtonsProps {
  balance: string;
  currentNetwork: SuperchainNetwork;
  networks: SuperchainNetwork[];
  onNetworkSelect: (networkId: number) => void;
}
