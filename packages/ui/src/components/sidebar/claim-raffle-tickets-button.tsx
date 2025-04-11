import { useSuperchainRaffle } from "@/hooks/use-superchain-raffle";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Ticket } from "lucide-react";
import React from "react";

export const ClaimRaffleTicketsButton: React.FC<{}> = () => {
  const { currentRaffle, isPending } = useSuperchainRaffle();

  if (
    currentRaffle === null ||
    currentRaffle?.claimableTickets === 0n ||
    isPending
  ) {
    return null;
  }

  return (
    <Link
      to="/profile"
      className="h-[70px] rounded-lg p-3 flex flex-col justify-between bg-[linear-gradient(-25deg,_#FF6375,_#FF0420,_#FF6375)] text-white"
    >
      <div className="flex items-center gap-2">
        <Ticket className="h-4 w-4" />
        <span className="text-sm">Superchain Raffle</span>
      </div>

      <div className="flex items-center gap-2 ml-6">
        <span className="font-medium text-sm">
          Claim {currentRaffle.claimableTickets.toString()} tickets
        </span>
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
};
