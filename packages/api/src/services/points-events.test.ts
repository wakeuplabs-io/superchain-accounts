import {
  PointEvent,
  PointEventType,
  Transaction,
  TransactionAction,
} from "@prisma/client";
import {
  DaysActivePointsEventsHandler,
  PointsEventsService,
  TokenSwapPointsEventsHandler,
  TransactionSentPointsEventsHandler,
  UniqueChainTransactionPointsEventsHandler,
} from "./points-events";

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
const mockPointEvent: PointEvent = {
  id: 1,
  transactionHash: mockTransfer.hash,
  type: PointEventType.TransactionsSent,
  data: "0x0",
  value: 1,
  minted: false,
};

describe("PointsEventsService", () => {
  it("Should call all handlers with transaction and return all events", async () => {
    const tx: Transaction = mockTransfer;

    const mockEvent1: PointEvent = { ...mockPointEvent, id: 1 };
    const mockEvent2: PointEvent = { ...mockPointEvent, id: 2 };

    const handler1 = {
      handle: jest.fn().mockResolvedValue([mockEvent1]),
    };

    const handler2 = {
      handle: jest.fn().mockResolvedValue([mockEvent2]),
    };

    const service = new PointsEventsService([handler1, handler2]);

    const result = await service.handleNewTransaction(tx);

    expect(handler1.handle).toHaveBeenCalledWith(tx);
    expect(handler2.handle).toHaveBeenCalledWith(tx);
    expect(result).toEqual([mockEvent1, mockEvent2]);
  });
});

describe("TransactionSentPointsEventsHandler", () => {
  const db = jestPrisma.client;

  const handler = new TransactionSentPointsEventsHandler(db, 1, [
    { count: 2, points: 1 },
  ]);

  it("Should assign pointsPerTx points for the transaction", async () => {
    const res = await handler.handle(
      await db.transaction.create({
        data: { ...mockTransfer },
      })
    );

    expect(res.length).toBe(1);
    expect(await db.pointEvent.count()).toBe(1);
    expect(
      await db.pointEvent.findFirst({
        where: {
          transactionHash: mockTransfer.hash,
          type: PointEventType.TransactionsSent,
          data: "",
        },
      })
    ).toEqual(res[0]);
  });

  it("Should not assign if already assigned", async () => {
    const tx = await db.transaction.create({
      data: { ...mockTransfer },
    });

    await handler.handle(tx);
    await handler.handle(tx);

    expect(await db.pointEvent.count()).toBe(1);
  });

  it("Should assign milestone points for the transaction", async () => {
    const res = await handler.handle(
      await db.transaction.create({
        data: { ...mockTransfer },
      })
    );

    // so far we should not have milestone points
    expect(res.length).toBe(1);
    expect(await db.pointEvent.count()).toBe(1);
    expect(
      await db.pointEvent.findFirst({
        where: {
          transactionHash: mockTransfer.hash,
          type: PointEventType.TransactionsSent,
          data: "",
        },
      })
    ).toEqual(res[0]);

    const res2 = await handler.handle(
      await db.transaction.create({
        data: { ...mockTransfer, hash: mockTransfer.hash + "2" },
      })
    );

    // now we should have milestone points
    expect(res2.length).toBe(2);

    // we include the points from the first transaction
    expect(await db.pointEvent.count()).toBe(3);

    // and find the milestone points
    expect(
      await db.pointEvent.findFirst({
        where: {
          transactionHash: mockTransfer.hash + "2",
          type: PointEventType.TransactionsSentMilestone,
          data: "2",
        },
      })
    ).toEqual(
      res2.find((r) => r.type === PointEventType.TransactionsSentMilestone)
    );
  });
});

describe("UniqueChainTransactionPointsEventsHandler", () => {
  const db = jestPrisma.client;

  const handler = new UniqueChainTransactionPointsEventsHandler(db, 1);

  it("Should assign pointsPerUniqueChainTransaction points for the transaction if first interaction with chain", async () => {
    // first chain interaction should assign points
    const res = await handler.handle(
      await db.transaction.create({
        data: { ...mockTransfer },
      })
    );

    expect(res.length).toBe(1);
    expect(await db.pointEvent.count()).toBe(1);
    expect(
      await db.pointEvent.findFirst({
        where: {
          transactionHash: mockTransfer.hash,
          type: PointEventType.UniqueChainUse,
          data: mockTransfer.chainId,
        },
      })
    ).toEqual(res[0]);

    // same chain tx should have no points
    const res2 = await handler.handle(
      await db.transaction.create({
        data: { ...mockTransfer, hash: mockTransfer.hash + "2" },
      })
    );

    expect(res2.length).toBe(0);
    expect(await db.pointEvent.count()).toBe(1);

    // different chain tx should assign points
    const res3 = await handler.handle(
      await db.transaction.create({
        data: { ...mockTransfer, chainId: "2", hash: mockTransfer.hash + "3" },
      })
    );

    expect(res3.length).toBe(1);
    expect(await db.pointEvent.count()).toBe(2);
    expect(
      await db.pointEvent.findFirst({
        where: {
          transactionHash: mockTransfer.hash + "3",
          type: PointEventType.UniqueChainUse,
          data: "2",
        },
      })
    ).toEqual(res3[0]);
  });

  it("Should not assign if already assigned", async () => {
    const tx = await db.transaction.create({
      data: { ...mockTransfer },
    });

    await handler.handle(tx);
    await handler.handle(tx);

    expect(await db.pointEvent.count()).toBe(1);
  });
});

describe("TokenSwapPointsEventsHandler", () => {
  const db = jestPrisma.client;

  const handler = new TokenSwapPointsEventsHandler(db, 1);

  it("Should assign pointsPerSwap points for the transaction if action is a swap", async () => {
    // first chain interaction should assign points
    const res = await handler.handle(
      await db.transaction.create({
        data: { ...mockTransfer, action: TransactionAction.SWAP },
      })
    );

    expect(res.length).toBe(1);
    expect(await db.pointEvent.count()).toBe(1);
    expect(
      await db.pointEvent.findFirst({
        where: {
          transactionHash: mockTransfer.hash,
          type: PointEventType.TokenSwap,
          data: "",
          value: 1,
        },
      })
    ).toEqual(res[0]);
  });

  it("Should not assign if already assigned", async () => {
    const tx = await db.transaction.create({
      data: { ...mockTransfer, action: TransactionAction.SWAP },
    });

    await handler.handle(tx);
    await handler.handle(tx);

    expect(await db.pointEvent.count()).toBe(1);
  });

  it("Should not assign if not a swap", async () => {
    const tx = await db.transaction.create({
      data: { ...mockTransfer, action: TransactionAction.TRANSFER },
    });

    await handler.handle(tx);

    expect(await db.pointEvent.count()).toBe(0);
  });
});

describe("DaysActivePointsEventsHandler", () => {
  const db = jestPrisma.client;

  const handler = new DaysActivePointsEventsHandler(db, [
    { count: 2, points: 1 },
  ]);

  it("Should assign based on milestonePointsConfig if threshold met", async () => {
    // same day so none should be assigned
    const res = await handler.handle(
      await db.transaction.create({
        data: { ...mockTransfer },
      })
    );
    const res2 = await handler.handle(
      await db.transaction.create({
        data: { ...mockTransfer, hash: mockTransfer.hash + "2" },
      })
    );

    expect(res.length).toBe(0);
    expect(res2.length).toBe(0);
    expect(await db.pointEvent.count()).toBe(0);

    // different day we met the 2 threshold
    const res3 = await handler.handle(
      await db.transaction.create({
        data: {
          ...mockTransfer,
          hash: mockTransfer.hash + "3",
          timestamp: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      })
    );

    expect(res3.length).toBe(1);
    expect(await db.pointEvent.count()).toBe(1);
    expect(
      await db.pointEvent.findFirst({
        where: {
          transactionHash: mockTransfer.hash + "3",
          type: PointEventType.DaysActive,
          data: "2", // threshold
        },
      })
    ).toEqual(res3[0]);
  });

  it("Should not assign if already assigned", async () => {
    // same day so none should be assigned
    await handler.handle(
      await db.transaction.create({
        data: { ...mockTransfer },
      })
    );

    // different day we met the 2 threshold
    await handler.handle(
      await db.transaction.create({
        data: {
          ...mockTransfer,
          hash: mockTransfer.hash + "2",
          timestamp: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      })
    );

    // different day but already assigned
    await handler.handle(
      await db.transaction.create({
        data: {
          ...mockTransfer,
          hash: mockTransfer.hash + "3",
          timestamp: new Date(Date.now() + 36 * 60 * 60 * 1000),
        },
      })
    );

    // different day we met the 2 threshold
    expect(await db.pointEvent.count()).toBe(1);
  });
});
