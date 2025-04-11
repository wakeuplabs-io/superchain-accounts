import {
  Transaction,
  PrismaClient,
  BadgeEventType,
  BadgeEvent,
  Prisma,
} from "@prisma/client";
import { ISuperchainBadgesService } from "../superchain-badges";

export interface BadgeEventsHandler {
  handle(tx: Transaction): Promise<BadgeEvent[]>;
}


// Since we dont have a domain layer. Why not this?
export type IBadgesEventsService = InstanceType<typeof BadgeEventsService>;
// export interface IBadgesEventsService {

//   getUserBadges(
//     address: string,
//     opts: { chainId?: string; limit?: number }
//   ): Promise<BadgeEventWithTransaction[]>;
//   handleNewTransaction(tx: Transaction): Promise<BadgeEvent[]>;
//   submit(): Promise<{ chainId: string; txHash: string }[]>;
// }

export type BadgeEventWithTransaction = Prisma.BadgeEventGetPayload<{
  include: { transaction: true };
}>;

export class BadgeEventsService {
  constructor(
    private repo: PrismaClient,
    private superchainBadgesService: ISuperchainBadgesService,
    private handlers: BadgeEventsHandler[],
    private badgeToTokenId: {
      [event in BadgeEventType]: { [threshold: number]: number };
    }
  ) {}

  async getUserBadges(
    address: string,
    opts?: { chainId?: string; limit?: number }
  ): Promise<BadgeEventWithTransaction[]> {
    return this.repo.badgeEvent.findMany({
      where: { transaction: { from: address }, chainId: opts?.chainId },
      include: { transaction: true },
      take: opts?.limit,
    });
  }

  async handleNewTransaction(tx: Transaction): Promise<BadgeEvent[]> {
    const events = await Promise.all(
      this.handlers.map((handler) => handler.handle(tx))
    );

    return events.flat();
  }

  async submit(): Promise<{ chainId: string; txHash: string }[]> {
    // get all non minted points
    const events = await this.repo.badgeEvent.findMany({
      where: { minted: false },
    });
    if (events.length === 0) {
      return [];
    }

    // group by chain id
    const eventsByChain = new Map<string, BadgeEvent[]>();
    for (const event of events) {
      if (!eventsByChain.has(event.chainId)) {
        eventsByChain.set(event.chainId, []);
      }
      eventsByChain.get(event.chainId)!.push(event);
    }

    // process for each chain
    const res: { chainId: string; txHash: string }[] = [];
    for (const [chainId, events] of eventsByChain) {
      const claimable = new Map<string, boolean>();
      for (const event of events) {
        const tokenId = this.badgeToTokenId[event.type][Number(event.data)];
        if (!tokenId) {
          continue;
        }

        claimable.set(`${event.user}:${tokenId}`, true);
      }
      if (claimable.size === 0) {
        continue;
      }
      

      // add claimable in contract
      const txHash = await this.superchainBadgesService.addClaimable(
        chainId,
        Array.from(claimable.keys()).map((k) => k.split(":")[0]),
        Array.from(claimable.keys()).map((k) => BigInt(k.split(":")[1]))
      );
      res.push({ chainId, txHash });

      // mark as minted
      await this.repo.badgeEvent.updateMany({
        where: { id: { in: events.map((e) => e.id) } },
        data: { minted: true },
      });
    }

    return res;
  }
}

