// EventService.ts
import { EventDef } from "@/types/index.js";
import { DocumentClient } from "aws-sdk/clients/dynamodb.js";

import { ConditionalEventProcessor } from "./ConditionalEventProcessor.js";
import { EventType, IEventProcessor } from "./types.js";
import { BasicEventProcessor } from "./BasicEventProcessor.js";

export class EventService {
  private processors: Map<EventType, IEventProcessor>;

  constructor(private client: DocumentClient) {
    this.processors = new Map([
      [EventType.Basic, new BasicEventProcessor(client)],
      [EventType.Conditional, new ConditionalEventProcessor(client)],
    ]);
  }

  public async processEvent(event: EventDef, address: string) {
    const processor = this.processors.get(event.event_type);
    if (!processor) {
      throw new Error("Invalid event type");
    }
    await processor.process(event, address);
  }
}
