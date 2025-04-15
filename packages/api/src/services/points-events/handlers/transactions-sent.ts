import {
  PointEvent,
  Transaction,
  PointEventType,
  PrismaClient,
} from "@prisma/client";
import { IPointsEventsHandler } from "@/domain/points";

export class TransactionSentPointsEventsHandler
  implements IPointsEventsHandler
{
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
        chainId: tx.chainId,
        user: tx.from,

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
        this.milestonePointsConfig.map(async (config) => {
          if (count >= config.count) {
            const existing = await this.repo.pointEvent.findFirst({
              where: {
                type: PointEventType.TransactionsSentMilestone,
                data: String(config.count),
                transaction: { from: tx.from },
              },
            });

            if (existing) {
              return existing;
            }

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
                user: tx.from,
                chainId: tx.chainId,
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
