import {
  PointEvent,
  Transaction,
  PointEventType,
  PrismaClient,
} from "@prisma/client";
import { IPointsEventsHandler } from "..";

export class DaysActivePointsEventsHandler implements IPointsEventsHandler {
  constructor(
    private repo: PrismaClient,
    private milestonePointsConfig: { count: number; points: number }[]
  ) {}

  async handle(tx: Transaction): Promise<PointEvent[]> {
    // assign milestone points
    const [{ count }] = await this.repo.$queryRawUnsafe<{ count: number }[]>(
      // use substr to get the first 10 characters of the timestamp 2025-04-08..
      `
      SELECT COUNT(DISTINCT DATE("timestamp")) as count 
      FROM "Transaction"
      WHERE "from" = $1
    `,
      tx.from
    );

    const milestoneEvents = (
      await Promise.all(
        this.milestonePointsConfig.map((config) => {
          if (count >= config.count) {
            // upsert won't work here, we can met conditions in multiple txs
            return this.repo.$transaction(async (dbTx) => {
              const existing = await dbTx.pointEvent.findFirst({
                where: {
                  type: PointEventType.DaysActive,
                  data: String(config.count),
                },
              });

              if (!existing) {
                return await dbTx.pointEvent.create({
                  data: {
                    transaction: { connect: { hash: tx.hash } },
                    type: PointEventType.DaysActive,
                    data: String(config.count),
                    value: config.points,
                  },
                });
              }
            });
          }
        })
      )
    ).filter((e) => !!e) as PointEvent[];

    return milestoneEvents;
  }
}
