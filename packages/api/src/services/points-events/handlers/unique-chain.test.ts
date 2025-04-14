import {
  PointEvent,
  PointEventType,
  Transaction,
  TransactionAction,
} from "@prisma/client";
import { UniqueChainTransactionPointsEventsHandler } from "./unique-chain";

const mockTransfer: Transaction = {
  action: TransactionAction.Transfer,
  data: "0x0",
  from: "0x123",
  to: "0x123",
  value: "0x0",
  hash: "0x123",
  chainId: "1",
  timestamp: new Date(),
};

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
