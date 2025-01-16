import envParsed from "@/envParsed.js";

import { DocumentClient } from "aws-sdk/clients/dynamodb.js";
import { EventDef } from "@/types/index.js";
import { Address } from "viem";
import { EventType, IEventProcessor } from "@/domain/events/types.js";
import { BasicEventProcessor } from "@/domain/events/BasicEventProcessor.js";
import { ConditionalEventProcessor } from "@/domain/events/ConditionalEventProcessor.js";

export class EventService {
  private processors: Map<EventType, IEventProcessor>;
  private defaultProcessor: IEventProcessor;
  constructor(private client: DocumentClient) {
    this.defaultProcessor = new BasicEventProcessor(client);
    this.processors = new Map([
      [EventType.Basic, new BasicEventProcessor(client)],
      [EventType.Conditional, new ConditionalEventProcessor(client)],
    ]);
  }
  private readonly event_table = envParsed().EVENTS_TABLE;
  private readonly event_PK = "EVENT#";
  private readonly event_SK = "TIMESTAMP";

  private readonly user_table = envParsed().USERS_TABLE;
  private readonly user_PK = "USER#";
  private readonly user_SK = "PROFILE";

  public async processEvent(event: EventDef, address: string) {
    const { event_type } = event;
    const processor = this.processors.get(event_type) || this.defaultProcessor;
    await processor.process(event, address);
  }
}

export class TimeframeEventsService {
  constructor(private client: DocumentClient) {}
  private readonly table = envParsed().TIMEFRAME_EVENTS_TABLE;
  private readonly PK = "TIMEFRAME#";
  private readonly SK = "TIMESTAMP";

  async createTimeBasedEventsForUser(userID: Address, eventsDef: EventDef[]) {
    const params = {
      TransactItems: eventsDef.map((event) => {
        return {
          Put: {
            TableName: this.table,
            Item: {
              PK: this.PK,
              SK: this.SK,
              event_type: event.event_type,
              chain: event.chain,
              points_awarded: event.points_awarded,
              user_id: userID,
              expires_on: event.expires_on_ttl,
              data: { ...event.args }, //metadata
              created_at: new Date().toISOString(),
            },
          },
        };
      }),
    };

    return this.client.transactWrite(params).promise();
  }
}
