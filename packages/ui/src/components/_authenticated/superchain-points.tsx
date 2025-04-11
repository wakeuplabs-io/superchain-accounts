import { Skeleton } from "../ui/skeleton";
import { useCallback, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import emptySvg from "../../assets/empty.svg";
import { useSuperchainPoints } from "@/hooks/use-superchain-points";
import { Button } from "../ui";
import { ScrollArea } from "../ui/scroll-area";

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

  const unknownAmount = useMemo(() => {
    return (
      claimable -
      events.reduce((total, event) => {
        return BigInt(total) + BigInt(event.value);
      }, 0n)
    );
  }, [claimable, events]);

  if (isPending) {
    return (
      <div className="max-w-md">
        <div className="mb-4 font-medium">Claimable Rewards</div>
        <div className="bg-white border rounded-lg p-8 space-y-4 h-[430px]">
          <Skeleton className="h-4 w-1/2 rounded-md" />
          <Skeleton className="h-8 w-full rounded-md" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      </div>
    );
  }

  if (claimable === 0n) {
    return (
      <div className="max-w-md">
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
    <div className="max-w-md">
      <div className="mb-4 font-medium">Claimable Rewards</div>
      <div className="bg-white border rounded-lg p-8 h-[430px] flex flex-col">
        <ScrollArea className="h-full">
          <ul className=" divide-y">
            {unknownAmount > 0n && (
              <li className="flex justify-between first:pt-0 pt-4 pb-4">
                <span className="font-semibold">Unknown</span>
                <span className="font-semibold">
                  {unknownAmount.toString()} points
                </span>
              </li>
            )}

            {events.map((event) => (
              <li
                key={event.id}
                className="flex justify-between first:pt-0 pt-4 pb-4"
              >
                <span>{event.type}</span>
                <span className="font-semibold">{event.value} points</span>
              </li>
            ))}
          </ul>
        </ScrollArea>

        <Button className="w-full" loading={isClaiming} onClick={onClaim}>
          Claim {claimable.toString()} Points
        </Button>
      </div>
    </div>
  );
};
