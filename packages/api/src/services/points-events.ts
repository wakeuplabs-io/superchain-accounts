import {
  PointEvent,
  Transaction,
  PointEventType,
  PrismaClient,
  db,
} from "@/database/client";

interface PointsEventsHandler {
  handle(tx: Transaction): Promise<PointEvent[]>;
}

export class PointsEventsService {
  constructor(
    private repo: PrismaClient,
    private handlers: PointsEventsHandler[]
  ) {}

  async handleNewTransaction(tx: Transaction): Promise<PointEvent[]> {
    const events = await Promise.all(
      this.handlers.map((handler) => handler.handle(tx))
    );

    return events.flat();
  }

  submit() {}
}

export class TransactionSentHandler implements PointsEventsHandler {
  constructor(
    private repo: PrismaClient,
    private pointsConfig: { count: number; reward: number }[]
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
        value: 1,
      },
    });

    const count = await this.repo.transaction.count({
      where: { from: tx.from },
    });

    const milestoneEvents = (
      await Promise.all(
        this.pointsConfig.map((config) => {
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
                value: config.reward,
              },
            });
          }
        })
      )
    ).filter((e) => !!e) as PointEvent[];

    return [event, ...milestoneEvents];
  }
}

export const pointsEventsService = new PointsEventsService(db, [
  new TransactionSentHandler(db, [{ count: 1, reward: 1 }]),
]);
