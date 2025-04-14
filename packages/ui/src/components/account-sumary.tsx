import { useSuperchainRaffle } from "@/hooks/use-superchain-raffle";
import { Skeleton } from "./ui/skeleton";
import { useSuperchainPoints } from "@/hooks/use-superchain-points";

export const AccountSummary: React.FC = () => {
  const { isPending: isPointsPending, balance } = useSuperchainPoints();
  const { isPending: isTicketsPending, currentRaffle } = useSuperchainRaffle();

  return (
    <div className="bg-white border rounded-lg p-8 lg:pr-0 gap-8 flex flex-col lg:flex-row lg:justify-between lg:items-center">
      <div className="space-y-1">
        <h1 className="font-semibold text-2xl text-center lg:text-left">
          Superchain Sparrow
        </h1>
      </div>

      <div className="grid grid-cols-2 divide-x lg:border-l">
        <div className="lg:w-52 lg:py-6 lg:space-y-2 flex flex-col justify-center">
          {isPointsPending ? (
            <Skeleton className="h-10 w-16 mx-auto" />
          ) : (
            <>
              <div className="text-center font-medium lg:text-2xl lg:font-semibold">
                {balance.toString() ?? 0}
              </div>
              <div className="text-center text-xs lg:font-medium">
                SC Points
              </div>
            </>
          )}
        </div>

        <div className="lg:w-52 lg:py-6 lg:space-y-2 flex flex-col justify-center">
          {isTicketsPending ? (
            <Skeleton className="h-10 w-16 mx-auto" />
          ) : (
            <>
              <div className="text-center font-medium lg:text-2xl lg:font-semibold">
                {currentRaffle?.claimedTickets.toString() ?? 0}
              </div>
              <div className="text-center text-xs lg:font-medium">Tickets</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
