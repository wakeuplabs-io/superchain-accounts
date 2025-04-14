import { AccountSummary } from "@/components/account-sumary";
import { ChainSelector } from "@/components/chain-selector";
import { SuperchainBadges } from "@/components/superchain-badges";
import { SuperchainPoints } from "@/components/superchain-points";
import { SuperchainRaffle } from "@/components/superchain-raffle";
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

      <AccountSummary />

      <div className="grid md:grid-cols-3 gap-6">
        <SuperchainRaffle />

        <SuperchainPoints />

        <SuperchainBadges />
      </div>
    </div>
  );
}
