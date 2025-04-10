import { ChainSelector } from "@/components/_authenticated/chain-selector";
import { SuperchainRaffle } from "@/components/_authenticated/superchain-raffle";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/profile")({
  component: Profile,
});

function Profile() {
  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-col gap-4">
        <p className="text-bas font-medium">Networks</p>
        <ChainSelector />
      </div>

      <SuperchainRaffle />
    </div>
  );
}
