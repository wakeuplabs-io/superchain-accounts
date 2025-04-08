import { ChainSelector } from "@/components/_authenticated/chain-selector";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/")({
  component: Index,
});

function Index() {
  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        <p className="text-base text-black font-medium">Networks</p>
        <ChainSelector />
      </div>
      {/* <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="mb-6">
          <AccountBalance points={points} network={currentNetwork} />
        </div>
        <ActionButtons network={currentNetwork} address={address} />
      </div> */}
    </div>
  );
  
}
