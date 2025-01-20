// EventProcessor.ts
import { DocumentClient } from "aws-sdk/clients/dynamodb.js";
import { EventDef } from "@/types/index.js";
import { IEventProcessor } from "./types.js";
import { EVENT_TABLE, USER_TABLE, TABLE_KEYS } from "./constants.js";

export abstract class BaseEventProcessor implements IEventProcessor {
  constructor(protected client: DocumentClient) {}

  abstract process(event: EventDef, address: string): Promise<void>;

  protected async grantPointsToUser(event: EventDef, address: string) {
    const { event_type, chain, points_awarded } = event;
    const params = {
      TransactItems: [
        {
          Put: {
            TableName: EVENT_TABLE,
            Item: {
              PK: TABLE_KEYS.EVENT.PK,
              SK: TABLE_KEYS.EVENT.SK,
              event_type,
              chain,
              points_awarded,
              data: { ...event.args },
              created_at: new Date().toISOString(),
            },
          },
        },
        {
          Update: {
            TableName: USER_TABLE,
            Key: {
              PK: `${TABLE_KEYS.USER.PK}${address}`,
              SK: TABLE_KEYS.USER.SK,
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
