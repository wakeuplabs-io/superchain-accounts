import {
  BadgeEvent,
  PointEventType,
  Transaction,
  TransactionAction,
} from "@prisma/client";
import { BadgeEventsService } from ".";

const mockTransfer: Transaction = {
  action: TransactionAction.TRANSFER,
  data: "0x0",
  from: "0x123",
  to: "0x123",
  value: "0x0",
  hash: "0x123",
  chainId: "1",
  timestamp: new Date(),
};
const mockBadgeEvent: BadgeEvent = {
  id: 1,
  type: PointEventType.TransactionsSent,
  data: "0x0",
  minted: false,
  transactionHash: "0x123",
};

describe("BadgeEventsService", () => {
  const db = jestPrisma.client;

  it("Should call all handlers with transaction and return all events", async () => {
    const tx: Transaction = mockTransfer;

    const mockBadgeEvent1: BadgeEvent = { ...mockBadgeEvent, id: 1 };
    const mockBadgeEvent2: BadgeEvent = { ...mockBadgeEvent, id: 2 };

    // mock handlers
    const handler1 = { handle: jest.fn().mockResolvedValue([mockBadgeEvent1]) };
    const handler2 = { handle: jest.fn().mockResolvedValue([mockBadgeEvent2]) };

    // mock superchain badges service
    const superchainBadgesService = { addClaimable: jest.fn() };

    // create service
    const service = new BadgeEventsService(
      db,
      [handler1, handler2],
      superchainBadgesService,
      new Map()
    );

    const result = await service.handleNewTransaction(tx);

    expect(handler1.handle).toHaveBeenCalledWith(tx);
    expect(handler2.handle).toHaveBeenCalledWith(tx);
    expect(superchainBadgesService.addClaimable).not.toHaveBeenCalled();
    expect(result).toEqual([mockBadgeEvent1, mockBadgeEvent2]);
  });
});
