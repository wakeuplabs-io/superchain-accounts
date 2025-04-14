import { BadgeEvent, Prisma, Transaction } from "@prisma/client";

export interface BadgeEventsHandler {
  handle(tx: Transaction): Promise<BadgeEvent[]>;
}

export interface IBadgesEventsService {
  getUserBadges(
    address: string,
    opts: { chainId?: string; limit?: number }
  ): Promise<BadgeEventWithTransaction[]>;
  handleNewTransaction(tx: Transaction): Promise<BadgeEvent[]>;
  submit(): Promise<{ chainId: string; txHash: string }[]>;
}

export type BadgeEventWithTransaction = Prisma.BadgeEventGetPayload<{
  include: { transaction: true };
}>;

export interface ISuperchainBadgesService {
  addClaimable(
    chainId: string,
    addresses: string[],
    tokenIds: bigint[]
  ): Promise<`0x${string}`>;
}
