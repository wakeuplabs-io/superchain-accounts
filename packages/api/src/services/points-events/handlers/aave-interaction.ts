import {
  PointEvent,
  Transaction,
  PointEventType,
  PrismaClient,
} from "@prisma/client";
import { IPointsEventsHandler } from "@/domain/points";

export class AaveInteractionPointsEventsHandler
  implements IPointsEventsHandler
{
  constructor(
    private repo: PrismaClient,
    private pointsPerInteraction: number
  ) {}

  async handle(tx: Transaction): Promise<PointEvent[]> {
    // TODO: update this, ideally attempt decoding data
    if (tx.to != "0x589750BA8aF186cE5B55391B0b7148cAD43a1619") {
      return [];
    }

    // assign one point for the transaction
    const event = await this.repo.pointEvent.upsert({
      where: {
        transactionHash_type_data: {
          transactionHash: tx.hash,
          type: PointEventType.AaveInteraction,
          data: tx.chainId,
        },
      },
      update: {},
      create: {
        transaction: { connect: { hash: tx.hash } },
        user: tx.from,
        chainId: tx.chainId,
        type: PointEventType.AaveInteraction,
        data: tx.chainId,
        value: this.pointsPerInteraction,
      },
    });

    return [event];
  }
}
