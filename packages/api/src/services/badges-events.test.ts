import {
  BadgeEvent,
  BadgeEventType,
  PointEventType,
  Transaction,
  TransactionAction,
} from "@prisma/client";
import {
  BadgeEventsService,
  DaysActiveBadgeEventsHandler,
  DefiInteractionsBadgeEventsHandler,
  TransactionSentBadgeEventsHandler,
} from "./badges-events";

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

    const handler1 = {
      handle: jest.fn().mockResolvedValue([mockBadgeEvent1]),
    };
    const handler2 = {
      handle: jest.fn().mockResolvedValue([mockBadgeEvent2]),
    };

    const service = new BadgeEventsService(db, [handler1, handler2]);

    const result = await service.handleNewTransaction(tx);

    expect(handler1.handle).toHaveBeenCalledWith(tx);
    expect(handler2.handle).toHaveBeenCalledWith(tx);
    expect(result).toEqual([mockBadgeEvent1, mockBadgeEvent2]);
  });
});

describe("TransactionSentBadgeEventsHandler", () => {
  const db = jestPrisma.client;

  const handler = new TransactionSentBadgeEventsHandler(db, [2]);

  it("Should assign badge if transaction send count threshold met", async () => {
    const res = await handler.handle(
      await db.transaction.create({
        data: { ...mockTransfer },
      })
    );

    // threshold not met
    expect(res.length).toBe(0);
    expect(await db.badgeEvent.count()).toBe(0);

    const res2 = await handler.handle(
      await db.transaction.create({
        data: { ...mockTransfer, hash: mockTransfer.hash + "2" },
      })
    );

    // threshold met
    expect(res2.length).toBe(1);
    expect(await db.badgeEvent.count()).toBe(1);
    expect(
      await db.badgeEvent.findFirst({
        where: {
          type: BadgeEventType.TransactionsSent,
          data: "2", // number of transactions
        },
      })
    ).toEqual(res2[0]);
  });

  it("Should not assign if already assigned", async () => {
    await handler.handle(
      await db.transaction.create({
        data: { ...mockTransfer },
      })
    );
    await handler.handle(
      await db.transaction.create({
        data: { ...mockTransfer, hash: mockTransfer.hash + "2" },
      })
    );
    await handler.handle(
      await db.transaction.create({
        data: { ...mockTransfer, hash: mockTransfer.hash + "3" },
      })
    );

    expect(await db.badgeEvent.count()).toBe(1);
  });
});

describe("DaysActiveBadgeEventsHandler", () => {
  const db = jestPrisma.client;

  const handler = new DaysActiveBadgeEventsHandler(db, [2]);

  it("Should assign badge if days active count threshold met", async () => {
    const res = await handler.handle(
      await db.transaction.create({
        data: { ...mockTransfer },
      })
    );

    // threshold not met
    expect(res.length).toBe(0);
    expect(await db.badgeEvent.count()).toBe(0);

    const res2 = await handler.handle(
      await db.transaction.create({
        data: { ...mockTransfer, hash: mockTransfer.hash + "2", timestamp: new Date(Date.now() + 48 * 60 * 60 * 1000) },
      })
    );

    // threshold met
    expect(res2.length).toBe(1);
    expect(await db.badgeEvent.count()).toBe(1);
    expect(
      await db.badgeEvent.findFirst({
        where: {
          type: BadgeEventType.DaysActive,
          data: "2", // number of transactions
        },
      })
    ).toEqual(res2[0]);
  });

  it("Should not assign if already assigned", async () => {
    await handler.handle(
      await db.transaction.create({
        data: { ...mockTransfer },
      })
    );
    await handler.handle(
      await db.transaction.create({
        data: { ...mockTransfer, hash: mockTransfer.hash + "2", timestamp: new Date(Date.now() + 48 * 60 * 60 * 1000) },
      })
    );
    await handler.handle(
      await db.transaction.create({
        data: { ...mockTransfer, hash: mockTransfer.hash + "3", timestamp: new Date(Date.now() + 36 * 60 * 60 * 1000) },
      })
    );

    expect(await db.badgeEvent.count()).toBe(1);
  });
});

describe("DefiInteractionsBadgeEventsHandler", () => {
  const db = jestPrisma.client;

  const handler = new DefiInteractionsBadgeEventsHandler(db, [2]);

  it("Should assign badge if defi interactions count threshold met", async () => {
    const res = await handler.handle(
      await db.transaction.create({
        data: { ...mockTransfer, action: TransactionAction.SWAP },
      })
    );

    // threshold not met
    expect(res.length).toBe(0);
    expect(await db.badgeEvent.count()).toBe(0);

    const res2 = await handler.handle(
      await db.transaction.create({
        data: {
          ...mockTransfer,
          hash: mockTransfer.hash + "2",
          action: TransactionAction.SWAP,
        },
      })
    );

    // threshold met
    expect(res2.length).toBe(1);
    expect(await db.badgeEvent.count()).toBe(1);
    expect(
      await db.badgeEvent.findFirst({
        where: {
          type: BadgeEventType.DefiInteractions,
          data: "2", // number of transactions
        },
      })
    ).toEqual(res2[0]);
  });

  it("Should not assign if already assigned", async () => {
    await handler.handle(
      await db.transaction.create({
        data: { ...mockTransfer, action: TransactionAction.SWAP },
      })
    );
    await handler.handle(
      await db.transaction.create({
        data: {
          ...mockTransfer,
          action: TransactionAction.SWAP,
          hash: mockTransfer.hash + "2",
        },
      })
    );
    await handler.handle(
      await db.transaction.create({
        data: {
          ...mockTransfer,
          action: TransactionAction.SWAP,
          hash: mockTransfer.hash + "3",
        },
      })
    );

    expect(await db.badgeEvent.count()).toBe(1);
  });
});
