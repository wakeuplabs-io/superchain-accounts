import { BadgeEventsHandler } from "@/domain/badges";
import {
  Transaction,
  PrismaClient,
  BadgeEventType,
  BadgeEvent,
} from "@prisma/client";

export class DaysActiveBadgeEventsHandler implements BadgeEventsHandler {
  constructor(
    private repo: PrismaClient,
    private thresholds: number[]
  ) {}

  async handle(tx: Transaction): Promise<BadgeEvent[]> {
    const [{ count }] = await this.repo.$queryRawUnsafe<{ count: number }[]>(
      // use substr to get the first 10 characters of the timestamp 2025-04-08..
      `
      SELECT COUNT(DISTINCT DATE("timestamp")) as count 
      FROM "Transaction"
      WHERE "from" = $1
    `,
      tx.from
    );

    return (
      await Promise.all(
        this.thresholds.map((threshold) => {
          if (count >= threshold) {
            return this.repo.badgeEvent.upsert({
              where: {
                type_data_user_chainId: {
                  user: tx.from,
                  chainId: tx.chainId,
                  type: BadgeEventType.DaysActive,
                  data: String(threshold),
                },
              },
              update: {},
              create: {
                transaction: { connect: { hash: tx.hash } },
                user: tx.from,
                chainId: tx.chainId,
                type: BadgeEventType.DaysActive,
                data: String(threshold),
              },
            });
          }
        })
      )
    ).filter((e) => !!e) as BadgeEvent[];
  }
}
