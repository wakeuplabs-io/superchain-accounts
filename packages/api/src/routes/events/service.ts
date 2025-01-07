import envParsed from "@/envParsed.js";

import { DocumentClient } from "aws-sdk/clients/dynamodb.js";
import { EventDef } from "@/types/index.js";

export class EventService {
  constructor(private client: DocumentClient) {}
  private readonly event_table = envParsed().EVENTS_TABLE;
  private readonly event_PK = "EVENT#";
  private readonly event_SK = "TIMESTAMP";

  private readonly user_table = envParsed().USERS_TABLE;
  private readonly user_PK = "USER#";
  private readonly user_SK = "PROFILE";

  async processEvent(event: EventDef, address: string) {
    const { eventType, chain, points_awarded } = event;
    const params = {
      TransactItems: [
        {
          Put: {
            TableName: this.event_table,
            Item: {
              PK: this.event_PK,
              SK: this.event_SK,
              event_type: eventType,
              chain,
              points_awarded: points_awarded,
              data: { ...event.args }, //metadata
              created_at: new Date().toISOString(),
            },
          },
        },
        {
          Update: {
            TableName: this.user_table,
            Key: {
              PK: `${this.user_PK}${address}`,
              SK: this.user_SK,
            },
            UpdateExpression: "ADD #points :incrementValue",
            ExpressionAttributeNames: {
              "#points": "superchain_points",
            },
            ExpressionAttributeValues: {
              ":incrementValue": points_awarded,
            },
            ReturnValues: "UPDATED_NEW",
          },
        },
      ],
    };
    return this.client.transactWrite(params).promise();
  }
}
