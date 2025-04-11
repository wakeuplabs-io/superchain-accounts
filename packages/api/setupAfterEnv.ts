import { db } from "./src/database/client";

// Why this is needed?
jestPrisma.initializeClient(db);
