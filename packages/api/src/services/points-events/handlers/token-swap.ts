import {
  PointEvent,
  Transaction,
  PointEventType,
  PrismaClient,
  TransactionAction,
} from "@prisma/client";
import { IPointsEventsHandler } from "@/domain/points";

export class TokenSwapPointsEventsHandler implements IPointsEventsHandler {
  constructor(
    private repo: PrismaClient,
    private pointsPerSwap: number
  ) {}

  async handle(tx: Transaction): Promise<PointEvent[]> {
    if (tx.action !== TransactionAction.Swap) {
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
        type: PointEventType.TokenSwap,
        value: this.pointsPerSwap,
        data: "",

        // transaction details
        transaction: { connect: { hash: tx.hash } },
        chainId: tx.chainId,
        user: tx.from,
      },
    });

    return [event];
  }
}
