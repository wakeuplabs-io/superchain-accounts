import {
  PointEvent,
  Transaction,
  PointEventType,
  PrismaClient,
} from "@prisma/client";
import { IPointsEventsHandler } from "@/domain/points";

export class UniqueChainTransactionPointsEventsHandler
  implements IPointsEventsHandler
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
        user: tx.from,
        chainId: tx.chainId,
        type: PointEventType.UniqueChainUse,
        data: tx.chainId,
        value: this.pointsPerUniqueChainTransaction,
      },
    });

    return [event];
  }
}
