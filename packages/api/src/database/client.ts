import { PrismaClient } from "./client/index";

export * from "./client/index";

export const db = new PrismaClient();
