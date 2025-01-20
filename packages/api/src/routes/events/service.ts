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
  private readonly SK = "TIMESTAMP#";

  async createTimeBasedEventsForUser(userID: Address, eventsDef: EventDef[]) {
    console.log(
      "Mapping timeframe events for user",
      userID,
      "events",
      eventsDef
    );
    const timestamp = new Date().getTime();
    const FULL_SK = `${this.SK}${timestamp}`;
    const params = {
      TransactItems: eventsDef.map((event) => {
        return {
          Put: {
            TableName: this.table,
            Item: {
              PK: `${this.PK}${userID}-${event.event_name}`,
              SK: FULL_SK,
              event_type: event.event_type,
              event_name: event.event_name,
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
    console.log("Creating events to be cron scheduled", JSON.stringify(params));
    await this.client.transactWrite(params).promise();
    return this.getEventsBySK(FULL_SK);
  }

  async getEventsBySK(sk: string) {
    const params = {
      TableName: this.table,
      FilterExpression: "begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":sk": sk,
      },
    };

    const { Items } = await this.client.scan(params).promise();
    return Items || [];
  }
}
