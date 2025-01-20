// constants.ts
import envParsed from "@/envParsed.js";
import { EventType } from "./types.js";

export const EVENT_TABLE = envParsed().EVENTS_TABLE;
export const USER_TABLE = envParsed().USERS_TABLE;
export const TIMEFRAME_TABLE = envParsed().TIMEFRAME_EVENTS_TABLE;

export const TABLE_KEYS = {
  EVENT: {
    PK: "EVENT#",
    SK: "TIMESTAMP",
  },
  USER: {
    PK: "USER#",
    SK: "PROFILE",
  },
  TIMEFRAME: {
    PK: "TIMEFRAME#",
    SK: "TIMESTAMP",
  },
} as const;

export enum EventName {
  ON_CHAIN_ACTIVITY = "on-chain-activity",
}

export const EventConditionKey = {
  ON_CHAIN_ACTIVITY: `${EventName.ON_CHAIN_ACTIVITY}:${EventType.Conditional}`,
} as const;
