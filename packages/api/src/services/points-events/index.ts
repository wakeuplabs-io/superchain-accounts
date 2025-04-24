import {
  PointEvent,
  Transaction,
  PrismaClient,
  TransactionAction,
} from "@prisma/client";
import {
  IPointsEventsHandler,
  IPointsEventsService,
  ISuperchainPointsService,
  PointEventWithTransaction,
} from "@/domain/points";
import { ClaimPointsBody } from "schemas";

export class PointsEventsService implements IPointsEventsService {
  constructor(
    private repo: PrismaClient,
    private superchainPointsService: ISuperchainPointsService,
    private handlers: IPointsEventsHandler[]
  ) {}

  async getUserPoints(
    address: string,
    opts: { chainId?: string; limit?: number }
  ): Promise<PointEventWithTransaction[]> {
    const lastClaimed = await this.repo.transaction.findFirst({
      where: { from: address, action: TransactionAction.ClaimPoints },
      orderBy: { timestamp: "desc" },
    });

    return this.repo.pointEvent.findMany({
      where: {
        transaction: {
          from: address,
          timestamp: { gte: lastClaimed?.timestamp },
        },
        chainId: opts?.chainId,
      },
      include: { transaction: true },
      take: opts?.limit,
    });
  }

  async handleNewTransaction(tx: Transaction): Promise<PointEvent[]> {
    const events = await Promise.all(
      this.handlers.map((handler) => handler.handle(tx))
    );

    return events.flat();
  }

  async submit(): Promise<{ chainId: string; txHash: string }[]> {
    // get all non minted points
    const events = await this.repo.pointEvent.findMany({
      where: { minted: false },
    });

    if (events.length === 0) {
      return [];
    }

    // group by chain id
    const eventsByChain = new Map<string, PointEvent[]>();
    for (const event of events) {
      if (!eventsByChain.has(event.chainId)) {
        eventsByChain.set(event.chainId, []);
      }
      eventsByChain.get(event.chainId)!.push(event);
    }

    // process for each chain
    const res: { chainId: string; txHash: string }[] = [];
    for (const [chainId, events] of eventsByChain) {
      // sum by address
      const claimable = new Map<string, bigint>();
      for (const event of events) {
        if (!claimable.has(event.user)) {
          claimable.set(event.user, BigInt(0));
        }

        claimable.set(
          event.user,
          claimable.get(event.user)! + BigInt(event.value)
        );
      }

      // add claimable in contract
      const txHash = await this.superchainPointsService.addClaimable(
        chainId,
        Array.from(claimable.keys()),
        Array.from(claimable.values())
      );
      res.push({ chainId, txHash });

      // mark as minted
      await this.repo.pointEvent.updateMany({
        where: { id: { in: events.map((e) => e.id) } },
        data: { minted: true },
      });
    }

    return res;
  }

  async claimPoints(points: ClaimPointsBody): Promise<PointEvent[]>  {
    return this.repo.pointEvent.updateManyAndReturn({
      where: {
        id: { in: points }
      },
      data: { claimed: true },
    });
  }
}
