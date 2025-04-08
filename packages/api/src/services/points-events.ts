import {
  PointEvent,
  Transaction,
  PointEventType,
  PrismaClient,
  TransactionAction,
  Prisma,
} from "@prisma/client";

interface PointsEventsHandler {
  handle(tx: Transaction): Promise<PointEvent[]>;
}

export type PointEventWithTransaction = Prisma.PointEventGetPayload<{
  include: { transaction: true };
}>;

export class PointsEventsService {
  constructor(
    private repo: PrismaClient,
    private handlers: PointsEventsHandler[]
  ) {}

  async getUserPoints(address: string): Promise<PointEventWithTransaction[]> {
    return this.repo.pointEvent.findMany({
      where: { transaction: { from: address } },
      include: { transaction: true },
    });
  }

  async handleNewTransaction(tx: Transaction): Promise<PointEvent[]> {
    const events = await Promise.all(
      this.handlers.map((handler) => handler.handle(tx))
    );

    return events.flat();
  }
}

export class TransactionSentPointsEventsHandler implements PointsEventsHandler {
  constructor(
    private repo: PrismaClient,
    private pointsPerTx: number,
    private milestonePointsConfig: { count: number; points: number }[]
  ) {}

  async handle(tx: Transaction): Promise<PointEvent[]> {
    // assign one point for the transaction
    const event = await this.repo.pointEvent.upsert({
      where: {
        transactionHash_type_data: {
          transactionHash: tx.hash,
          type: PointEventType.TransactionsSent,
          data: "",
        },
      },
      update: {},
      create: {
        transaction: { connect: { hash: tx.hash } },
        type: PointEventType.TransactionsSent,
        data: "",
        value: this.pointsPerTx,
      },
    });

    // assign milestone points
    const count = await this.repo.transaction.count({
      where: { from: tx.from },
    });

    const milestoneEvents = (
      await Promise.all(
        this.milestonePointsConfig.map((config) => {
          if (count >= config.count) {
            return this.repo.pointEvent.upsert({
              where: {
                transactionHash_type_data: {
                  transactionHash: tx.hash,
                  type: PointEventType.TransactionsSentMilestone,
                  data: String(config.count),
                },
              },
              update: {},
              create: {
                transaction: { connect: { hash: tx.hash } },
                type: PointEventType.TransactionsSentMilestone,
                data: String(config.count),
                value: config.points,
              },
            });
          }
        })
      )
    ).filter((e) => !!e) as PointEvent[];

    return [event, ...milestoneEvents];
  }
}

export class UniqueChainTransactionPointsEventsHandler
  implements PointsEventsHandler
{
  constructor(
    private repo: PrismaClient,
    private pointsPerUniqueChainTransaction: number
  ) {}

  async handle(tx: Transaction): Promise<PointEvent[]> {
    const chainTxCount = await this.repo.transaction.count({
      where: { from: tx.from, chainId: tx.chainId },
    });

    if (chainTxCount > 1) {
      return [];
    }

    // assign one point for the transaction
    const event = await this.repo.pointEvent.upsert({
      where: {
        transactionHash_type_data: {
          transactionHash: tx.hash,
          type: PointEventType.UniqueChainUse,
          data: tx.chainId,
        },
      },
      update: {},
      create: {
        transaction: { connect: { hash: tx.hash } },
        type: PointEventType.UniqueChainUse,
        data: tx.chainId,
        value: this.pointsPerUniqueChainTransaction,
      },
    });

    return [event];
  }
}

export class TokenSwapPointsEventsHandler implements PointsEventsHandler {
  constructor(
    private repo: PrismaClient,
    private pointsPerSwap: number
  ) {}

  async handle(tx: Transaction): Promise<PointEvent[]> {
    if (tx.action !== TransactionAction.SWAP) {
      return [];
    }

    // assign one point for the transaction
    const event = await this.repo.pointEvent.upsert({
      where: {
        transactionHash_type_data: {
          transactionHash: tx.hash,
          type: PointEventType.TokenSwap,
          data: "",
        },
      },
      update: {},
      create: {
        transaction: { connect: { hash: tx.hash } },
        type: PointEventType.TokenSwap,
        data: "",
        value: this.pointsPerSwap,
      },
    });

    return [event];
  }
}

export class DaysActivePointsEventsHandler implements PointsEventsHandler {
  constructor(
    private repo: PrismaClient,
    private milestonePointsConfig: { count: number; points: number }[]
  ) {}

  async handle(tx: Transaction): Promise<PointEvent[]> {
    // assign milestone points
    const [{ count }] = await this.repo.$queryRawUnsafe<{ count: number }[]>(
      // use substr to get the first 10 characters of the timestamp 2025-04-08..
      `
      SELECT COUNT(DISTINCT DATE("timestamp")) as count 
      FROM "Transaction"
      WHERE "from" = $1
    `,
      tx.from
    );

    const milestoneEvents = (
      await Promise.all(
        this.milestonePointsConfig.map((config) => {
          if (count >= config.count) {
            // upsert won't work here, we can met conditions in multiple txs
            return this.repo.$transaction(async (dbTx) => {
              const existing = await dbTx.pointEvent.findFirst({
                where: {
                  type: PointEventType.DaysActive,
                  data: String(config.count),
                },
              });

              if (!existing) {
                return await dbTx.pointEvent.create({
                  data: {
                    transaction: { connect: { hash: tx.hash } },
                    type: PointEventType.DaysActive,
                    data: String(config.count),
                    value: config.points,
                  },
                });
              }
            });
          }
        })
      )
    ).filter((e) => !!e) as PointEvent[];

    return milestoneEvents;
  }
}
