import { Clock, Ticket, Trophy } from "lucide-react";
import { Button } from "../ui";
import { useSuperchainRaffle } from "@/hooks/use-superchain-raffle";
import { Skeleton } from "../ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useCountdown } from "@/hooks/use-countdown";
import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";

export const SuperchainRaffle: React.FC<{}> = () => {
  const {
    claimableTickets,
    claimedTickets,
    isPending,
    prizeAmount,
    totalTickets,
    revealedAt,
    claimTickets,
    isClaiming,
  } = useSuperchainRaffle();

  const { days, hours, minutes } = useCountdown(new Date(revealedAt));

  const onClaim = useCallback(async () => {
    claimTickets()
      .then((tx) => {
        toast({
          title: "Tickets claimed",
          description: `You have successfully claimed your tickets ${tx}`,
        });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: `There was an error claiming your tickets ${error}`,
        });
      });
  }, [claimTickets]);

  if (isPending) {
    return (
      <div className="max-w-md">
        <div className="mb-4 font-medium">Superchain Raffle</div>
        <div className="bg-white border rounded-lg p-8 space-y-4">
          <Skeleton className="h-4 w-1/2 rounded-md" />
          <Skeleton className="h-8 w-full rounded-md" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <div className="mb-4 font-medium">Superchain Raffle</div>
      <div className="bg-white border rounded-lg p-8">
        <div className="flex gap-2 mb-4">
          <Clock className="w-5 h-5" />
          <span className="text-sm font-medium">Winner revealed in:</span>
        </div>

        {/* Countdown */}
        <div className="flex divide-x mb-6">
          {/* Days */}
          <div className="text-center flex-1">
            <div className="text-2xl font-semibold">{days}</div>
            <div className="text-sm">Days</div>
          </div>

          {/* Hours */}
          <div className="text-center flex-1">
            <div className="text-2xl font-semibold">{hours}</div>
            <div className="text-sm">Hours</div>
          </div>

          {/* Minutes */}
          <div className="text-center flex-1">
            <div className="text-2xl font-semibold">{minutes}</div>
            <div className="text-sm">Minutes</div>
          </div>
        </div>

        {/* Jackpot */}
        <div className="flex justify-between items-center h-[72px] rounded-md bg-[#FFF7D5] p-6 mb-8">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#F7B139]" />
            <span className="text-xs">Jackpot</span>
          </div>

          <span>+{prizeAmount} SCP</span>
        </div>

        {/* Tickets count */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Ticket className="w-6 h-6" />
              <span className="text-sm">Total tickets</span>
            </div>

            <span>{totalTickets}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Ticket className="w-6 h-6 text-red-500" />
              <span className="text-sm">Your tickets</span>
            </div>

            <span>{claimedTickets}</span>
          </div>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="w-full" asChild>
              <Button
                disabled={claimableTickets == 0}
                loading={isClaiming}
                className="w-full mt-8"
                onClick={onClaim}
              >
                Claim Tickets
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>
                {claimableTickets > 0
                  ? claimedTickets === claimableTickets
                    ? "Claimed all tickets"
                    : `Claim ${claimableTickets} tickets`
                  : "You're not eligible for this round"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
