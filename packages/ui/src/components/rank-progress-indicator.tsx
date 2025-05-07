// Define rank types and their colors
export type RankType =
  | "Superchain Sparrow"
  | "Superchain Panther"
  | "Superchain Phoenix";

interface RankProgressIndicatorProps {
  pointsToNextRank: number | undefined;
  currentRank: RankType;
  nextRank: RankType | undefined;
  progressQuantity?: number; // Optional: current progress value (0-100)
  className?: string;
}

// Map ranks to their colors
const rankColors: Record<RankType, string> = {
  "Superchain Sparrow": "hsl(var(--primary))",
  "Superchain Panther": "#FFB404",
  "Superchain Phoenix": "#04FF75",
};

export const userRanks = [
  {
    rank: "Superchain Sparrow",
    minPoints: 0,
    maxPoints: 1000,
  },
  {
    rank: "Superchain Panther",
    minPoints: 1001,
    maxPoints: 10000,
  },
  {
    rank: "Superchain Phoenix",
    minPoints: 10001,
    maxPoints: undefined,
  },
] as const;

export default function RankProgressIndicator({
  pointsToNextRank,
  currentRank,
  nextRank,
  progressQuantity = 0,
  className = "",
}: RankProgressIndicatorProps) {
  // Get the color for the current rank
  const currentRankColor = rankColors[currentRank];

  // For highest rank, set progress to 100%
  const isHighestRank = currentRank === "Superchain Phoenix" && !nextRank;
  const effectiveProgress = isHighestRank ? 100 : progressQuantity;

  return (
    <div className={`flex flex-col gap-2 w-full max-w-3xl ${className}`}>
      {/* Progress bar container */}
      <div className="relative flex items-center w-full h-[19px] bg-muted rounded-full">
        {/* Background progress bar */}
        {(effectiveProgress > 0 || isHighestRank) && (
          <div
            className="absolute left-0 top-0 h-full rounded-full z-0"
            style={{
              width: `${Math.min(Math.max(effectiveProgress, 0), 100)}%`,
              backgroundColor: currentRankColor,
            }}
          />
        )}

        {/* Rank indicator circle with dynamic color */}
        <div
          className="h-[19px] w-[19px] rounded-full flex-shrink-0 z-10 relative ml-0"
          style={{ backgroundColor: currentRankColor }}
        ></div>
      </div>

      {/* Text below the progress bar */}
      <div className="text-left text-sm text-muted-foreground">
        {isHighestRank ? (
          <p>Congrats! You've reached the highest Rank.</p>
        ) : (
          nextRank &&
          pointsToNextRank && (
            <p>
              {pointsToNextRank} points to become {nextRank}
            </p>
          )
        )}
      </div>
    </div>
  );
}
