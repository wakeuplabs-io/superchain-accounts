import {
  PointEvent,
  PointEventType,
  Transaction,
  TransactionAction,
} from "@prisma/client";
import {
  PointsEventsService,
  TransactionSentPointsEventsHandler,
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
