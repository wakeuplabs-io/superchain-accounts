import { TransactionAction } from "@prisma/client";

describe("UserService", () => {
  const prisma = jestPrisma.client;

  test("Add user", async () => {
    

    const createdUser = await prisma.transaction.create({
      data: {
        action: TransactionAction.TRANSFER,
        data: "0x0",
        from: "0x123",
        to: "0x123",
        value: "0x0",
        hash: "0x123",
        chainId: "1",
      },
    });

    expect(
      await prisma.transaction.findFirst({
        where: {
            hash: "0x123",
        },
      })
    ).toStrictEqual(createdUser);
  });
});
