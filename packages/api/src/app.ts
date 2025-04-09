import express from "express";
import envParsed from "@/envParsed";
import serverless from "serverless-http";

// middlewares
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import * as errorMiddlewares from "@/middlewares/errors";

// services
import { db } from "./database/client";
import { TransactionService } from "./services/transactions";
import { SuperchainPointsService } from "./services/superchain-points";
import { PointsEventsService } from "./services/points-events";
import { TransactionSentPointsEventsHandler } from "./services/points-events/handlers/transactions-sent";
import { DaysActivePointsEventsHandler } from "./services/points-events/handlers/days-active";
import { UniqueChainTransactionPointsEventsHandler } from "./services/points-events/handlers/unique-chain";
import { TokenSwapPointsEventsHandler } from "./services/points-events/handlers/token-swap";
import { BadgeEventsService } from "./services/badge-events";
import { TransactionSentBadgeEventsHandler } from "./services/badge-events/handlers/transaction-sent";
import { DaysActiveBadgeEventsHandler } from "./services/badge-events/handlers/days-active";
import { DefiInteractionsBadgeEventsHandler } from "./services/badge-events/handlers/defi-interactions";

// routes
import buildPointsRoutes from "./routes/points/route";
import buildTransactionsRoutes from "./routes/transactions/route";
import buildBadgesRoutes from "./routes/badges/route";
import buildHealthRoutes from "./routes/health/route";
import { SuperchainBadgesService } from "./services/superchain-badges";

const app = express();

// instantiate services

const transactionService = new TransactionService(db);

const superchainPointsService = new SuperchainPointsService();

const superchainBadgesService = new SuperchainBadgesService();

const pointsEventsService = new PointsEventsService(
  db,
  [
    new TransactionSentPointsEventsHandler(db, 1, [
      { count: 10, points: 10 },
      { count: 50, points: 50 },
      { count: 100, points: 100 },
    ]),
    new DaysActivePointsEventsHandler(db, [
      { count: 10, points: 10 },
      { count: 50, points: 50 },
      { count: 100, points: 100 },
    ]),
    new UniqueChainTransactionPointsEventsHandler(db, 5),
    new TokenSwapPointsEventsHandler(db, 5),
  ],
  superchainPointsService
);

const badgesEventsService = new BadgeEventsService(
  db,
  [
    new TransactionSentBadgeEventsHandler(db, [10, 50, 100]),
    new DaysActiveBadgeEventsHandler(db, [10, 50, 100]),
    new DefiInteractionsBadgeEventsHandler(db, [10, 50, 100]),
  ],
  superchainBadgesService,
  new Map()
);

// devops middlewares

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

// routes

app.use("/health", buildHealthRoutes());
app.use("/badges", buildBadgesRoutes(badgesEventsService));
app.use("/points", buildPointsRoutes(pointsEventsService));
app.use(
  "/transactions",
  buildTransactionsRoutes(
    transactionService,
    pointsEventsService,
    badgesEventsService
  )
);

// error middlewares

app.use(errorMiddlewares.notFound);
app.use(errorMiddlewares.errorHandler);

// start server

if (envParsed().NODE_ENV === "development") {
  app.listen(envParsed().PORT, () => {
    console.log(`App Started at PORT=${envParsed().PORT}`);
  });
}

// serverless handler

export const handler = serverless(app);
