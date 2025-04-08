import {
  Transaction,
  PrismaClient,
  BadgeEventType,
  BadgeEvent,
} from "@/database/client";

interface BadgeEventsHandler {
  handle(tx: Transaction): Promise<BadgeEvent[]>;
}

export class BadgeEventsService {
  constructor(private handlers: BadgeEventsHandler[]) {}

  async handleNewTransaction(tx: Transaction): Promise<BadgeEvent[]> {
    const events = await Promise.all(
      this.handlers.map((handler) => handler.handle(tx))
    );

    return events.flat();
  }
}

export class TransactionSentBadgeEventsHandler implements BadgeEventsHandler {
  constructor(
    private repo: PrismaClient,
    private badgesThreshold: number[]
  ) {}

  async handle(tx: Transaction): Promise<BadgeEvent[]> {
    // assign milestone points
    const count = await this.repo.transaction.count({
      where: { from: tx.from },
    });

    const milestoneEvents = (
      await Promise.all(
        this.badgesThreshold.map((threshold) => {
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
                transactions: { connect: { hash: tx.hash } },
                type: BadgeEventType.TransactionsSent,
                data: String(threshold),
              },
            });
          }
        })
      )
    ).filter((e) => !!e) as BadgeEvent[];

    return milestoneEvents;
  }
}
