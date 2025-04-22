import { PrismaClient } from "@prisma/client";
import { IUserService } from "@/domain/users";
import { Profile } from "schemas";
import { Address } from "viem";

type UserPosition = {
  user: Address;
  total_points: number;
  current: number;
  total: number;
  percentile: number;
}

export class UsersService implements IUserService {
  constructor(private repo: PrismaClient) {}

  async getProfile(wallet: Address): Promise<Profile> {
    const result = await this.getUserPosition(wallet); 

    if(!result) {
      throw new Error("User not found");
    }

    const { current, total } = result;

    return {
      position: {
        current,
        total,
      }
    };
  }

  private async getUserPosition(wallet: Address): Promise<UserPosition>  {
    const result = await this.repo.$queryRawUnsafe(`
        WITH user_points AS (
        SELECT 
            "user",
            SUM(value) AS total_points
        FROM "PointEvent"
        WHERE claimed = true
        GROUP BY "user"
        ),
        ranked_users AS (
        SELECT 
            "user",
            total_points,
            RANK() OVER (ORDER BY total_points DESC) AS current
        FROM user_points
        ),
        total_users AS (
        SELECT COUNT(*) AS total FROM user_points
        ),
        target_user AS (
         SELECT 
            ru."user",
            ru.total_points,
            ru.current,
            tu.total,
            ROUND(100.0 * ru.current / tu.total, 2) AS percentile
            FROM ranked_users ru, total_users tu
            WHERE ru."user" = $1
        )
        SELECT * FROM target_user
        UNION ALL
        SELECT 
        $1 AS "user",
        0 AS total_points,
        0 AS rank,
        tu.total,
        0.0 AS percentile
        FROM total_users tu
        WHERE NOT EXISTS (SELECT 1 FROM target_user)`
    , wallet);

    const userPosition = (result as UserPosition)[0];

    return {
      ...userPosition,
      current: Number(userPosition.current),
      total: Number(userPosition.total),
      total_points: Number(userPosition.total_points)
    };
  }
}