// types.ts
import { DocumentClient } from "aws-sdk/clients/dynamodb.js";
import { EventDef } from "@/types/index.js";

export interface IEventProcessor {
  process(event: EventDef, address: string): Promise<void>;
}

export interface EventServiceDeps {
  client: DocumentClient;
}

export enum EventType {
  Basic = "basic",
  Conditional = "conditional",
}

export type GrantCondition = (
  event: EventDef,
  address: string
) => Promise<boolean>;

export interface EventConditionsMap {
  [key: string]: GrantCondition;
}
