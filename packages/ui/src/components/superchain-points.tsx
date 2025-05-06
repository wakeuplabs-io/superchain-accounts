import { Skeleton } from "@/components/ui/skeleton";
import { useCallback, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import emptySvg from "@/assets/empty.svg";
import { useSuperchainPoints } from "@/hooks/use-superchain-points";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { shortenAddress } from "@/lib/address";
import { formatUnits } from "viem";

export const SuperchainPoints: React.FC = () => {
  const { isPending, claim, claimable, isClaiming, events } =
    useSuperchainPoints();

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

  const onClaim = useCallback(async () => {
    claim(claimableEvents)
      .then(() => {
        toast({
          title: "Points claimed",
          description: "You have successfully claimed your points",
        });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: `There was an error claiming your points ${error}`,
        });
      });
  }, [claim, claimableEvents]);

  if (isPending) {
    return (
      <div className="w-full xl:w-[30%] 2xl:w-[25%]">
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
      <div className="xl:w-[30%] 2xl:w-[25%]">
        <div className="mb-4 font-medium">Claimable Rewards</div>
        <div className="bg-white border rounded-lg p-8 flex flex-col justify-center items-center h-[430px]">
          <img src={emptySvg} alt="" className="mb-11 h-20 w-20" />
          <div className="text-center mb-6 font-medium">
            No rewards to claim...yet!
          </div>
          <div className="text-center text-muted-foreground">
            Engage with the chain to earn points and unlock fresh rewards.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="xl:w-[30%] 2xl:w-[25%]">
      <div className="mb-4 font-medium">Claimable Rewards</div>
      <div className="bg-white border rounded-lg p-8 h-[430px] flex flex-col gap-4">
        <ScrollArea className="h-full">
          <ul className="divide-y">
            {unknownAmount > 0n && (
              <li className="flex justify-between first:pt-0 pt-4 pb-4">
                <span className="font-semibold">Unknown</span>
                <span className="font-semibold">
                  {unknownAmount.toString()} pts
                </span>
              </li>
            )}

            {claimableEvents.map((event) => (
              <li
                key={event.id}
                className="flex justify-between first:pt-0 pt-4 pb-4"
              >
                <div className="xl:w-3/5">
                  <div className="truncate">{event.type}</div>
                  <div className="text-xs">
                    {shortenAddress(event.transactionHash)}
                  </div>
                </div>
                <span className="font-semibold">{event.value} pts</span>
              </li>
            ))}

            {notYetClaimableEvents.map((event) => (
              <li
                key={event.id}
                className="flex justify-between first:pt-0 pt-4 pb-4 opacity-50"
              >
                <div className="xl:w-3/5">
                  <div className="truncate">{event.type}</div>
                  <div className="text-xs">Not yet claimable</div>
                </div>
                <span className="font-semibold">{event.value} pts</span>
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
          Claim {claimable > 0n && formatUnits(claimable, 18)} Points
        </Button>
      </div>
    </div>
  );
};
