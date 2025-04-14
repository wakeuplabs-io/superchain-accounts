import { BadgeEventsHandler } from "@/domain/badges";
import {
  Transaction,
  PrismaClient,
  BadgeEventType,
  BadgeEvent,
  TransactionAction,
} from "@prisma/client";

export class DefiInteractionsBadgeEventsHandler implements BadgeEventsHandler {
  constructor(
    private repo: PrismaClient,
    private thresholds: number[]
  ) {}

  async handle(tx: Transaction): Promise<BadgeEvent[]> {
    const count = await this.repo.transaction.count({
      where: {
        from: tx.from,
        // so far we only support swaps
        action: { in: [TransactionAction.Swap] },
      },
    });

    return (
      await Promise.all(
        this.thresholds.map((threshold) => {
          if (count >= threshold) {
            return this.repo.badgeEvent.upsert({
              where: {
                type_data_user_chainId: {
                  user: tx.from,
                  chainId: tx.chainId,
                  type: BadgeEventType.DefiInteractions,
                  data: String(threshold),
                },
              },
              update: {},
              create: {
                transaction: { connect: { hash: tx.hash } },
                user: tx.from,
                chainId: tx.chainId,
                type: BadgeEventType.DefiInteractions,
                data: String(threshold),
              },
            });
          }
        })
      )
    ).filter((e) => !!e) as BadgeEvent[];
  }
}
