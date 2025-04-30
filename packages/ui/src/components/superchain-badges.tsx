import { useCallback, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSuperchainBadges } from "@/hooks/use-superchain-badges";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import emptySvg from "@/assets/empty.svg";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader } from "./ui/dialog";

export const SuperchainBadges: React.FC = () => {
  const { isPending, claim, isClaiming, badges } =
    useSuperchainBadges();

  const onClickNftUrl = useCallback(
    (url: string, tokenName: string) => {
      <Dialog>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tokenName}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col w-full items-center gap-12 justify-center pt-16 pb-8">
            <div className="relative">
                <img src={url}/>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    },
    []
  );

  const onClaim = useCallback(
    async (tokenId: bigint) => {
      claim(tokenId)
        .then(() => {
          toast({
            title: "Badge claimed",
            description: "You have successfully claimed your badge",
          });
        })
        .catch((error) => {
          toast({
            title: "Error",
            description: `There was an error claiming your badge ${error}`,
          });
        });
    },
    [claim]
  );

  const sortedBadges = useMemo(() => badges ? badges.sort((a, b) => {
    if (a.status === b.status) {
      return a.id > b.id ? 1 : -1;
    }

    if (a.status === "unclaimed") {
      return -1;
    }

    if(a.status === "claimed" && b.status === "pending") {
      return -1;
    }

    if(b.status === "unclaimed") {
      return 1;
    }

    if(b.status === "claimed" && a.status === "pending") {
      return 1;
    }
  
    return 0;
  }) : [], [badges]);

  if (isPending) {
    return (
      <div className="w-full xl:w-[35%] 2xl:w-[45%]">
        <div className="mb-4 font-medium">Accomplishments</div>
        <div className="bg-white border rounded-lg p-8 space-y-4 h-[430px]">
          <Skeleton className="h-4 w-1/2 rounded-md" />
          <Skeleton className="h-8 w-full rounded-md" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      </div>
    );
  }

  if (!badges || badges.length === 0) {
    return (
      <div className="xl:w-[35%] 2xl:w-[45%]">
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
    <div className="xl:w-[35%] 2xl:w-[45%]">
      <div className="mb-4 font-medium">Accomplishments</div>
      <div className="h-[430px]">
        <ScrollArea className="h-full">
          <div className="grid grid-cols-1 gap-2 2xl:grid-cols-2">
            {sortedBadges.map((badge) => (
              <div
                key={badge.id}
                className={cn(
                  "flex gap-3 items-center p-6 rounded-lg bg-white h-[100px] shadow-sm",
                  {
                    "border border-primary": badge.status === "unclaimed",
                  }
                )}
              >
                <img src={badge.image} alt="" className="h-[38px] w-[38px]" />
                <div className="space-y-1">
                  <div className="font-semibold text-sm">{badge.name}</div>
                  <div className="text-xs">{badge.description}</div>
                  {badge.status === "claimed" && <div className="w-fit text-sm text-green-600 bg-green-100 border border-green-600 px-2 rounded">Claimed</div>}
                  {badge.status === "claimed" && 
                    (
                      <a
                        onClick={() => onClickNftUrl(badge.nftUrl, badge.name)}
                        className="flex items-center gap-1 text-sm font-medium text-primary"
                      >
                        <span>View my NFT</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    )
                  }
                  {badge.status === "unclaimed" && (
                    <Button
                      onClick={() => onClaim(badge.id)}
                      loading={isClaiming}
                      className="flex items-center px-0 py-0 h-5 text-xs"
                      variant="link"
                    >
                      <span>Claim Badge</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
