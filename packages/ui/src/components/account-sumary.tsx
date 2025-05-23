import { useSuperchainPoints } from "@/hooks/use-superchain-points";
import { Skeleton } from "./ui/skeleton";
import { useSuperchainProfile } from "@/hooks/use-superchain-profile";
import { formatUnits } from "viem";
import RankProgressIndicator, {
  RankType,
  userRanks,
} from "./rank-progress-indicator";

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

  const pointsToNextRank =
    superchainRank?.maxPoints !== undefined
      ? superchainRank.maxPoints - superchainPoints
      : undefined;

  const progressQuantity = superchainRank?.maxPoints
    ? (superchainPoints / superchainRank.maxPoints) * 100
    : 100;

  return (
    <div className="bg-white border rounded-lg p-8 lg:pr-0 gap-8 flex flex-col lg:flex-row lg:justify-between lg:items-start">
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

            <RankProgressIndicator
              pointsToNextRank={pointsToNextRank}
              currentRank={profile.rank as RankType}
              nextRank={nextRank}
              progressQuantity={progressQuantity}
            />
          </>
        )}
      </div>

      <div className="w-full lg:ml-auto flex justify-between lg:justify-start lg:w-auto">
        <div className="w-1/2 lg:w-52 lg:py-6 lg:space-y-2 flex flex-col justify-center relative">
          {isPointsPending ? (
            <Skeleton className="h-10 w-16 mx-auto" />
          ) : (
            <>
              <div className="text-center font-medium lg:text-2xl lg:font-semibold">
                {profile.position.current}/{profile.position.total}
              </div>
              <div className="text-center text-xs lg:font-medium">Position</div>
            </>
          )}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[80%] w-[1px] bg-border hidden sm:block"></div>
        </div>

        <div className="w-1/2 lg:w-52 lg:py-6 lg:space-y-2 flex flex-col justify-center">
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
