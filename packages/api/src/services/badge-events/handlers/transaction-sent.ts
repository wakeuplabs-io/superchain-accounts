import {
    Transaction,
    PrismaClient,
    BadgeEventType,
    BadgeEvent,
  } from "@prisma/client";
  import { BadgeEventsHandler } from "..";
  

export class TransactionSentBadgeEventsHandler implements BadgeEventsHandler {
  constructor(
    private repo: PrismaClient,
    private thresholds: number[]
  ) {}

  async handle(tx: Transaction): Promise<BadgeEvent[]> {
    const count = await this.repo.transaction.count({
      where: { from: tx.from },
    });

    return (
      await Promise.all(
        this.thresholds.map((threshold) => {
          if (count >= threshold) {
            return this.repo.badgeEvent.upsert({
              where: {
                type_data: {
                  type: BadgeEventType.TransactionsSent,
                  data: String(threshold),
                },
              },
              update: {},
              create: {
                transaction: { connect: { hash: tx.hash } },
                type: BadgeEventType.TransactionsSent,
                data: String(threshold),
              },
            });
          }
        })
      )
    ).filter((e) => !!e) as BadgeEvent[];
  }
}