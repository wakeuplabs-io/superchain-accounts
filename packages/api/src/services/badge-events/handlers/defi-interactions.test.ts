import { BadgeEventType, Transaction, TransactionAction } from "@prisma/client";
import { DefiInteractionsBadgeEventsHandler } from "./defi-interactions";

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
