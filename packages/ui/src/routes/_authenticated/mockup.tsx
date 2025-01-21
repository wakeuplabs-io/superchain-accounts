import { createFileRoute } from "@tanstack/react-router";
import { SmartAccountCard } from "@/components/_authenticated/SmartAccountCard/SmartAccountContainer";
import { SuperchainNetwork } from "@/types";
import { base, optimism } from "viem/chains";

export const Route = createFileRoute("/_authenticated/mockup")({
  component: MockupPage,
});

function MockupPage() {
  const mockNetworks: SuperchainNetwork[] = [
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
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Mockup Development Page</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Smart Account Card</h2>
          <SmartAccountCard
            address="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
            points={1234}
            networks={mockNetworks}
            currentNetwork={mockNetworks[0]}
            onNetworkSelect={(networkId) =>
              console.log("Network selected:", networkId)
            }
            onSend={() => console.log("Send clicked")}
            onImport={() => console.log("Import clicked")}
          />
        </section>
      </div>
    </div>
  );
}
