// src/routes/mockups/accounts.tsx
import { createFileRoute } from "@tanstack/react-router";
import { SmartAccountCard } from "@/components/ui/SmartAccountCard/SmartAccountContainer";
import { SuperchainNetwork } from "@/types";
import { base, optimism } from "viem/chains";
import { useState } from "react";

export const Route = createFileRoute("/mockups/accounts")({
  component: AccountsMockup,
});

function AccountsMockup() {
  const [accountPoints] = useState<number>(0);
  const testNetworks: SuperchainNetwork[] = [
    {
      ...optimism,
      isConnected: true,
      symbol: "OP",
      color: "#FF0420",
    },
    {
      ...base,
      isConnected: false,
      symbol: "BASE",
      color: "#0052FF",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        <SmartAccountCard
          currentNetwork={testNetworks[0]}
          networks={testNetworks}
          points={accountPoints}
          address="0x3bG008Fc35...2742"
          onNetworkSelect={(networkId) =>
            console.log("Network selected:", networkId)
          }
        />
      </div>
    </div>
  );
}
