import { AssetList } from "@/components/home/asset-list/asset-list";
import { ChainSelector } from "@/components/chain-selector";
import { SmartAccountCard } from "@/components/home/smart-account-card";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/accounts")({
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-col gap-4">
        <p className="text-base text-black font-medium">Networks</p>
        <ChainSelector />
      </div>

      <SmartAccountCard />
      
      <AssetList />
    </div>
  );
}
