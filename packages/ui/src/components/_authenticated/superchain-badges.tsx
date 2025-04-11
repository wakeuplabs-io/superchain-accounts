import { Skeleton } from "../ui/skeleton";
import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import emptySvg from "../../assets/empty.svg";
import { useSuperchainBadges } from "@/hooks/use-superchain-badges";
import { Button } from "../ui";
import { ArrowRight } from "lucide-react";

export const SuperchainBadges: React.FC<{}> = () => {
  const { isPending, claim, claimable, isClaiming, badges } =
    useSuperchainBadges();

  const onClaim = useCallback(async (tokenId: bigint) => {
    claim(tokenId)
      .then(() => {
        toast({
          title: "Badge claimed",
          description: `You have successfully claimed your badge`,
        });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: `There was an error claiming your badge ${error}`,
        });
      });
  }, [claim]);

  if (isPending) {
    return (
      <div className="max-w-md">
        <div className="mb-4 font-medium">Accomplishments</div>
        <div className="bg-white border rounded-lg p-8 space-y-4 h-[430px]">
          <Skeleton className="h-4 w-1/2 rounded-md" />
          <Skeleton className="h-8 w-full rounded-md" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      </div>
    );
  }

  if (claimable.length === 0 && badges.length === 0) {
    return (
      <div className="max-w-md">
        <div className="mb-4 font-medium">Accomplishments</div>
        <div className="bg-white border rounded-lg p-8 flex flex-col justify-center items-center h-[430px]">
          <img src={emptySvg} alt="" className="mb-11 h-20 w-20" />
          <div className="text-center mb-6 font-medium">
            Oops! No accomplishments so far
          </div>
          <div className="text-center text-muted-foreground">
            Start making transactions to earn badges
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <div className="mb-4 font-medium">Accomplishments</div>
      <ScrollArea className="h-full">
        <ul className="grid grid-cols">
          {claimable.map((badge) => (
            <li
              key={badge.id}
              className="flex gap-2 items-center p-6 border rounded-lg bg-white border-primary h-[85px]"
            >
              <img src={badge.imageUrl} alt="" className="h-[38px] w-[38px]" />
              <div>
                <div className="font-semibold text-sm">{badge.name}</div>
                <Button
                  onClick={() => onClaim(badge.id)}
                  loading={isClaiming}
                  className="flex items-center px-0 py-0 h-5 text-xs"
                  variant="link"
                >
                  <span>Claim Badge</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </li>
          ))}

          {badges.map((badge) => (
            <li
              key={badge.id}
              className="flex gap-2 items-center p-6 border rounded-lg bg-white"
            >
              <img src={badge.imageUrl} alt="" className="h-10 w-10" />
              <div>
                <div className="font-semibold text-sm">{badge.name}</div>
                <div className="text-xs">{badge.description}</div>
              </div>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
};
