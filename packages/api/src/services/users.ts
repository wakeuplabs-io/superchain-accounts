import { PrismaClient } from "@prisma/client";
import { IUserService, UserPosition, UserRank } from "@/domain/users";
import { Profile } from "schemas";
import { Address } from "viem";

export class UsersService implements IUserService {
  private userRanks: UserRank[];
  
  constructor(private repo: PrismaClient, userRanks: UserRank[]) {
    this.userRanks = userRanks.sort((a, b) => b.minPoints - a.minPoints);
  }

  async getProfile(wallet: Address): Promise<Profile> {
    await this.registerUser(wallet);

    const result = await this.getUserPosition(wallet); 

    if(!result) {
      throw new Error("User not found");
    }

    const { current, total, totalPoints, percentile } = result;

    return {
      rank: this.getUserRank(totalPoints)?.rank ?? "",
      position: {
        current,
        total,
        percentile
      }
    };
  }

  private async registerUser(wallet: Address) {
    return this.repo.user.upsert({
      where: {
        wallet: wallet,
      },
      create: {
        wallet: wallet,
      },
      update: {},
    });
  }

  private getUserRank(points: number): UserRank | undefined {
    return this.userRanks.find((rank) => points >= rank.minPoints);
  }

  private async getUserPosition(wallet: Address): Promise<UserPosition>  {
    const result = await this.repo.$queryRawUnsafe<{ user: string, total_points: bigint, rank: bigint, total: bigint, percentile: number }>(`
        WITH user_points AS (
          SELECT 
            u.wallet AS "user",
            COALESCE(SUM(pe.value), 0) AS total_points
          FROM "User" u
          LEFT JOIN "PointEvent" pe ON pe."user" = u.wallet AND pe.claimed = true
          GROUP BY u.wallet
        ),
        ranked_users AS (
          SELECT 
            "user",
            total_points,
            ROW_NUMBER() OVER (ORDER BY total_points DESC) AS current
          FROM user_points
        ),
        total_users AS (
           SELECT COUNT(*) AS total FROM user_points
        )
        SELECT 
            ru."user",
            ru.total_points,
            ru.current,
            tu.total,
            ROUND(100.0 * ru.current / tu.total, 2) AS percentile
        FROM ranked_users ru, total_users tu
        WHERE ru."user" = $1`, wallet);

    const userPosition = result[0];

    return {
      ...userPosition,
      current: Number(userPosition.current),
      total: Number(userPosition.total),
      totalPoints: Number(userPosition.total_points),
      percentile: Number(userPosition.percentile),
    };
  }
}