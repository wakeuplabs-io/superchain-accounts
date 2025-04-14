import { PointEventType, Transaction, TransactionAction } from "@prisma/client";
import { TokenSwapPointsEventsHandler } from "./token-swap";

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

describe("TokenSwapPointsEventsHandler", () => {
  const db = jestPrisma.client;

  const handler = new TokenSwapPointsEventsHandler(db, 1);

  it("Should assign pointsPerSwap points for the transaction if action is a swap", async () => {
    // first chain interaction should assign points
    const res = await handler.handle(
      await db.transaction.create({
        data: { ...mockTransfer, action: TransactionAction.Swap },
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
      data: { ...mockTransfer, action: TransactionAction.Swap },
    });

    await handler.handle(tx);
    await handler.handle(tx);

    expect(await db.pointEvent.count()).toBe(1);
  });

  it("Should not assign if not a swap", async () => {
    const tx = await db.transaction.create({
      data: { ...mockTransfer, action: TransactionAction.Transfer },
    });

    await handler.handle(tx);

    expect(await db.pointEvent.count()).toBe(0);
  });
});
