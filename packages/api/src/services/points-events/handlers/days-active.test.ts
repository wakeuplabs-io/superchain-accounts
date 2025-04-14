import {
  PointEvent,
  PointEventType,
  Transaction,
  TransactionAction,
} from "@prisma/client";
import { DaysActivePointsEventsHandler } from "./days-active";

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
