import { Skeleton } from "@/components/ui/skeleton";
import { useCallback, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import emptySvg from "@/assets/empty.svg";
import { useSuperchainPoints } from "@/hooks/use-superchain-points";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { shortenAddress } from "@/lib/address";

export const SuperchainPoints: React.FC<{}> = () => {
  const { isPending, claim, claimable, isClaiming, events } =
    useSuperchainPoints();

  const onClaim = useCallback(async () => {
    claim()
      .then(() => {
        toast({
          title: "Points claimed",
          description: `You have successfully claimed your points`,
        });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: `There was an error claiming your points ${error}`,
        });
      });
  }, [claim]);

  const claimableEvents = useMemo(() => {
    return events.filter((event) => event.minted == true);
  }, [events]);

  const notYetClaimableEvents = useMemo(() => {
    return events.filter((event) => event.minted == false);
  }, [events]);

  const unknownAmount = useMemo(() => {
    return (
      claimable -
      claimableEvents.reduce((total, event) => {
        return BigInt(total) + BigInt(event.value);
      }, 0n)
    );
  }, [claimable, events]);

  if (isPending) {
    return (
      <div>
        <div className="mb-4 font-medium">Claimable Rewards</div>
        <div className="bg-white border rounded-lg p-8 space-y-4 h-[430px]">
          <Skeleton className="h-4 w-1/2 rounded-md" />
          <Skeleton className="h-8 w-full rounded-md" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      </div>
    );
  }

  if (events.length === 0 && claimable === 0n) {
    return (
      <div>
        <div className="mb-4 font-medium">Claimable Rewards</div>
        <div className="bg-white border rounded-lg p-8 flex flex-col justify-center items-center h-[430px]">
          <img src={emptySvg} alt="" className="mb-11 h-20 w-20" />
          <div className="text-center mb-6 font-medium">
            Oops! No rewards available at the moment
          </div>
          <div className="text-center text-muted-foreground">
            Take a look at your accomplishments to keep earning and unlocking
            rewards!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 font-medium">Claimable Rewards</div>
      <div className="bg-white border rounded-lg p-8 h-[430px] flex flex-col">
        <ScrollArea className="h-full">
          <ul className="divide-y">
            {unknownAmount > 0n && (
              <li className="flex justify-between first:pt-0 pt-4 pb-4">
                <span className="font-semibold">Unknown</span>
                <span className="font-semibold">
                  {unknownAmount.toString()} points
                </span>
              </li>
            )}

            {claimableEvents.map((event) => (
              <li
                key={event.id}
                className="flex justify-between first:pt-0 pt-4 pb-4"
              >
                <div>
                  <div>{event.type}</div>
                  <div className="text-xs">{shortenAddress(event.transactionHash)}</div>
                </div>
                <span className="font-semibold">{event.value} points</span>
              </li>
            ))}

            {notYetClaimableEvents.map((event) => (
              <li
                key={event.id}
                className="flex justify-between first:pt-0 pt-4 pb-4 opacity-50"
              >
                <div>
                  <div>{event.type}</div>
                  <div className="text-xs">Not yet claimable</div>
                </div>
                <span className="font-semibold">{event.value} points</span>
              </li>
            ))}
          </ul>
        </ScrollArea>

        <Button
          className="w-full"
          loading={isClaiming}
          onClick={onClaim}
          disabled={claimable <= 0}
        >
          Claim {claimable > 0n && claimable.toString()} Points
        </Button>
      </div>
    </div>
  );
};
