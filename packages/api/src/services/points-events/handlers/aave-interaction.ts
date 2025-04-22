import {
  PointEvent,
  Transaction,
  PointEventType,
  PrismaClient,
} from "@prisma/client";
import { IPointsEventsHandler } from "@/domain/points";
import { AAVE_CONTRACT_ADDRESS } from "@/config/blockchain";

export class AaveInteractionPointsEventsHandler
implements IPointsEventsHandler
{
  constructor(
    private repo: PrismaClient,
    private pointsPerInteraction: number
  ) {}

  async handle(tx: Transaction): Promise<PointEvent[]> {
    const aaveContract = AAVE_CONTRACT_ADDRESS[tx.chainId];

    // TODO: update this, ideally attempt decoding data
    if (!aaveContract  || tx.to !== aaveContract) {
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
