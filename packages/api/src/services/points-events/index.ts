import {
  PointEvent,
  Transaction,
  PointEventType,
  PrismaClient,
  TransactionAction,
  Prisma,
} from "@prisma/client";
import { ISuperchainPointsService } from "../superchain-points";

export interface IPointsEventsHandler {
  handle(tx: Transaction): Promise<PointEvent[]>;
}

export interface IPointsEventsService {
  getUserPoints(address: string): Promise<PointEventWithTransaction[]>;

  handleNewTransaction(tx: Transaction): Promise<PointEvent[]>;

  submit(): Promise<void>;
}

export type PointEventWithTransaction = Prisma.PointEventGetPayload<{
  include: { transaction: true };
}>;

export class PointsEventsService implements IPointsEventsService {
  constructor(
    private repo: PrismaClient,
    private handlers: IPointsEventsHandler[],
    private superchainPointsService: ISuperchainPointsService
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

  async submit(): Promise<void> {
    // get all non minted points
    const events = await this.repo.pointEvent.findMany({
      where: { minted: false },
      include: { transaction: true },
    });
    if (events.length === 0) {
      return;
    }

    // sum by address
    const claimable = new Map<string, bigint>();
    for (const event of events) {
      if (!claimable.has(event.transaction.from)) {
        claimable.set(event.transaction.from, BigInt(0));
      }

      claimable.set(
        event.transaction.from,
        claimable.get(event.transaction.from)! + BigInt(event.value)
      );
    }

    // add claimable in contract
    await this.superchainPointsService.addClaimable(
      Array.from(claimable.keys()),
      Array.from(claimable.values())
    );

    // mark as minted
    await this.repo.pointEvent.updateMany({
      where: { id: { in: events.map((e) => e.id) } },
      data: { minted: true },
    });
  }
}
