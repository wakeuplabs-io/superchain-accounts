import express from "express";
import envParsed from "@/envParsed";
import serverless from "serverless-http";

// middlewares
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import * as errorMiddlewares from "@/middlewares/errors";

// services
import { BadgeEventType, db } from "./database/client";
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
import buildUserRoutes from "./routes/users/route";
import { SuperchainBadgesService } from "./services/superchain-badges";
import { ClientFactory } from "./services/client-factory";
import { BundlerFactory } from "./services/bundler-factory";
import { UserTokenService } from "./services/user-token";
import { AaveInteractionPointsEventsHandler } from "./services/points-events/handlers/aave-interaction";

// instantiate services

const clientFactory = new ClientFactory();

const bundlerFactory = new BundlerFactory(clientFactory);

const transactionService = new TransactionService(db, bundlerFactory);

const superchainPointsService = new SuperchainPointsService(
  envParsed().SUPERCHAIN_POINTS_ADDRESS as `0x${string}`,
  clientFactory
);

const badgesService = new SuperchainBadgesService(
  envParsed().SUPERCHAIN_BADGES_ADDRESS as `0x${string}`,
  clientFactory
);

const pointsEventsService = new PointsEventsService(
  db,
  superchainPointsService,
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
    new AaveInteractionPointsEventsHandler(db, 5),
  ]
);

const badgesEventsService = new BadgeEventsService(
  db,
  badgesService,
  [
    new TransactionSentBadgeEventsHandler(db, [25, 50, 100]),
    new DaysActiveBadgeEventsHandler(db, [25, 50, 100]),
    new DefiInteractionsBadgeEventsHandler(db, [25, 50, 100]),
  ],
  {
    [BadgeEventType.DaysActive]: { 25: 1, 50: 2, 100: 3 },
    [BadgeEventType.TransactionsSent]: { 25: 4, 50: 5, 100: 6 },
    [BadgeEventType.DefiInteractions]: { 25: 7, 50: 8, 100: 9 },
  }
);

const userTokenService = new UserTokenService(db, clientFactory);

// instantiate express

const app = express();

// middlewares

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

// routes

app.use("/health", buildHealthRoutes());
app.use("/badges", buildBadgesRoutes(badgesEventsService, badgesService));
app.use("/points", buildPointsRoutes(pointsEventsService));
app.use(
  "/transactions",
  buildTransactionsRoutes(
    transactionService,
    pointsEventsService,
    badgesEventsService
  )
);
app.use("/users", buildUserRoutes(userTokenService));

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
