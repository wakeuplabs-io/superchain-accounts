import { PointEvent, Prisma, Transaction } from "@prisma/client";

export interface IPointsEventsHandler {
  handle(tx: Transaction): Promise<PointEvent[]>;
}

export interface IPointsEventsService {
  getUserPoints(
    address: string,
    opts: { chainId?: string; limit?: number }
  ): Promise<PointEventWithTransaction[]>;
  handleNewTransaction(tx: Transaction): Promise<PointEvent[]>;
  submit(): Promise<{ chainId: string; txHash: string }[]>;
}

export type PointEventWithTransaction = Prisma.PointEventGetPayload<{
  include: { transaction: true };
}>;

export interface ISuperchainPointsService {
  addClaimable(
    chainId: string,
    addresses: string[],
    tokenIds: bigint[]
  ): Promise<`0x${string}`>;
}
