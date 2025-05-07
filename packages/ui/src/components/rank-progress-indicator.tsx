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

export default function RankProgressIndicator({
  pointsToNextRank,
  currentRank,
  nextRank,
  progressQuantity = 0,
  className = "",
}: RankProgressIndicatorProps) {
  // Get the color for the current rank
  const currentRankColor = rankColors[currentRank];

  return (
    <div
      className={`relative flex items-center w-full max-w-3xl max-h-[19px] bg-muted rounded-full px-1 py-1 ${className}`}
    >
      {/* Background progress bar (if progressQuantity is provided) */}
      {progressQuantity !== undefined && progressQuantity > 0 && (
        <div
          className="absolute left-0 top-0 h-full rounded-full z-0"
          style={{
            width: `${Math.min(Math.max(progressQuantity, 0), 100)}%`,
            backgroundColor: currentRankColor,
          }}
        />
      )}

      {/* Rank indicator circle with dynamic color - positioned above progress bar */}
      <div
        className="h-8 w-8 rounded-full flex-shrink-0 z-10 max-h-[19px] relative"
        style={{ backgroundColor: currentRankColor }}
      ></div>

      {/* Progress text - positioned above progress bar */}
      {nextRank && pointsToNextRank && (
        <div className="flex-1 text-center z-10 relative">
          <p className="text-[#7a879a] text-sm font-medium">
            {pointsToNextRank} points to become{" "}
            {nextRank.charAt(0).toUpperCase() + nextRank.slice(1)}
          </p>
        </div>
      )}
      {!nextRank && currentRank && currentRank === "Superchain Phoenix" && (
        <div className="flex-1 text-center z-10 relative">
          <p className="text-[#7a879a] text-sm font-medium">
            You have reached the highest rank
          </p>
        </div>
      )}
    </div>
  );
}
