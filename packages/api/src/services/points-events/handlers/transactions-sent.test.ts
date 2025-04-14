import { PointEventType, Transaction, TransactionAction } from "@prisma/client";
import { TransactionSentPointsEventsHandler } from "./transactions-sent";

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
