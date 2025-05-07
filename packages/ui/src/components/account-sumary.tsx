import { useSuperchainPoints } from "@/hooks/use-superchain-points";
import { Skeleton } from "./ui/skeleton";
import { useSuperchainProfile } from "@/hooks/use-superchain-profile";
import { formatUnits } from "viem";
import RankProgressIndicator, { RankType } from "./rank-progress-indicator";
import { userRanks } from "@/services/user";

export const AccountSummary: React.FC = () => {
  const { isPending: isProfilePending, profile } = useSuperchainProfile();
  const { points, isPending: isPointsPending } = useSuperchainPoints();

  const superchainPoints = Math.floor(Number(formatUnits(points, 18))) ?? 0;
  const superchainRank = userRanks.find(
    (rank) => rank.minPoints <= superchainPoints
  );
  const nextRank = userRanks.find(
    (rank) => rank.minPoints > superchainPoints
  )?.rank;
  console.log("Next Rank", nextRank);

  const pointsToNextRank =
    superchainRank?.maxPoints !== undefined
      ? superchainRank.maxPoints - superchainPoints
      : undefined;
  console.log("Points to next rank", pointsToNextRank);

  const progressQuantity = superchainRank?.maxPoints
    ? (superchainPoints / superchainRank.maxPoints) * 100
    : 100;

  console.log("progressQuantity", progressQuantity);

  return (
    <div className="bg-white border rounded-lg p-8 lg:pr-0 gap-8 flex flex-col lg:flex-row lg:justify-between lg:items-center">
      <div className="flex flex-col w-full lg:max-w-[390px] gap-3">
        {isProfilePending ? (
          <>
            <Skeleton className="h-10 w-1/2 self-center md:self-start" />
            <Skeleton className="h-8 w-full mx-auto" />
          </>
        ) : (
          <>
            <h1 className="font-semibold text-2xl text-center lg:text-left">
              {profile.rank}
            </h1>
            <div>
              <RankProgressIndicator
                pointsToNextRank={pointsToNextRank}
                currentRank={profile.rank as RankType}
                nextRank={nextRank}
                progressQuantity={progressQuantity}
              />
            </div>
            <div>
              <span className="text-base font-medium">Position:</span>
              <span className="text-base font-semibold ml-2">
                {profile.position.current}/{profile.position.total}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="lg:border-l">
        <div className="lg:w-52 lg:py-6 lg:space-y-2 flex flex-col justify-center">
          {isPointsPending ? (
            <Skeleton className="h-10 w-16 mx-auto" />
          ) : (
            <>
              <div className="text-center font-medium lg:text-2xl lg:font-semibold">
                {superchainPoints}
              </div>
              <div className="text-center text-xs lg:font-medium">
                SC Points
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
