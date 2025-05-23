import { BadgeEventType, Transaction, TransactionAction } from "@prisma/client";
import { TransactionSentBadgeEventsHandler } from "./transaction-sent";

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
