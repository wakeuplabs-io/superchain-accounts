import {
  Transaction,
  PrismaClient,
  BadgeEventType,
  BadgeEvent,
  TransactionAction,
} from "@prisma/client";

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
                transactions: { connect: { hash: tx.hash } },
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
                type_data: {
                  type: BadgeEventType.DaysActive,
                  data: String(threshold),
                },
              },
              update: {},
              create: {
                transactions: { connect: { hash: tx.hash } },
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
        action: { in: [TransactionAction.SWAP] },
      },
    });

    return (
      await Promise.all(
        this.thresholds.map((threshold) => {
          if (count >= threshold) {
            return this.repo.badgeEvent.upsert({
              where: {
                type_data: {
                  type: BadgeEventType.DefiInteractions,
                  data: String(threshold),
                },
              },
              update: {},
              create: {
                transactions: { connect: { hash: tx.hash } },
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
