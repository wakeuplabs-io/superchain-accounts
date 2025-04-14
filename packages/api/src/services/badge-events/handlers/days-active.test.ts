import { BadgeEventType, Transaction, TransactionAction } from "@prisma/client";
import { DaysActiveBadgeEventsHandler } from "./days-active";

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
        data: {
          ...mockTransfer,
          hash: mockTransfer.hash + "2",
          timestamp: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
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
        data: {
          ...mockTransfer,
          hash: mockTransfer.hash + "2",
          timestamp: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      })
    );
    await handler.handle(
      await db.transaction.create({
        data: {
          ...mockTransfer,
          hash: mockTransfer.hash + "3",
          timestamp: new Date(Date.now() + 36 * 60 * 60 * 1000),
        },
      })
    );

    expect(await db.badgeEvent.count()).toBe(1);
  });
});
