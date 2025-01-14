import { SuperchainNetwork } from "@/types";

interface NetworkIconProps {
  network: SuperchainNetwork;
  className?: string;
}

export const NetworkIcon = ({ network, className = "" }: NetworkIconProps) => (
  <div
    className={`flex h-8 w-8 items-center justify-center rounded-full ${className}`}
    style={{ backgroundColor: network.id === 10 ? "#FF0420" : "#0052FF" }}
  >
    <span className="text-sm font-bold text-white">
      {network.id === 10 ? "OP" : "BASE"}
    </span>
  </div>
);
