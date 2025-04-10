import {
  PointEvent,
  PointEventType,
  Transaction,
  TransactionAction,
} from "@prisma/client";
import { PointsEventsService } from ".";

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
  user: mockTransfer.from,
  chainId: mockTransfer.chainId,
  type: PointEventType.TransactionsSent,
  data: "0x0",
  value: 1,
  minted: false,
};

describe("PointsEventsService", () => {
  const db = jestPrisma.client;

  it("Should call all handlers with transaction and return all events", async () => {
    const tx: Transaction = mockTransfer;

    const mockEvent1: PointEvent = { ...mockPointEvent, id: 1 };
    const mockEvent2: PointEvent = { ...mockPointEvent, id: 2 };

    // mock handlers
    const handler1 = {
      handle: jest.fn().mockResolvedValue([mockEvent1]),
    };
    const handler2 = {
      handle: jest.fn().mockResolvedValue([mockEvent2]),
    };

    // mock superchain points service
    const superchainPointsService = {
      addClaimable: jest.fn(),
    };

    // create service
    const service = new PointsEventsService(
      db,
      superchainPointsService,
      [handler1, handler2]
    );

    // call service
    const result = await service.handleNewTransaction(tx);

    expect(handler1.handle).toHaveBeenCalledWith(tx);
    expect(handler2.handle).toHaveBeenCalledWith(tx);
    expect(superchainPointsService.addClaimable).not.toHaveBeenCalled();
    expect(result).toEqual([mockEvent1, mockEvent2]);
  });

  it("Should call all handlers with transaction and return all events", async () => {
    const tx = await db.transaction.create({
      data: { ...mockTransfer },
    });
    const pointEvent = await db.pointEvent.create({
      data: { ...mockPointEvent },
    });

    // mock superchain points service
    const superchainPointsService = {
      addClaimable: jest.fn(),
    };

    // create service
    const service = new PointsEventsService(db, superchainPointsService, []);

    // call submit
    await service.submit();

    expect(superchainPointsService.addClaimable).toHaveBeenCalledWith(
      tx.chainId,
      [tx.from],
      [BigInt(pointEvent.value)]
    );
    expect(await db.pointEvent.count({ where: { minted: false } })).toBe(0);
  });
});
