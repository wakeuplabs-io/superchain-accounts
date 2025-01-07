import envParsed from "@/envParsed.js";
import { EventDef } from "@/types/index.js";
import { DocumentClient } from "aws-sdk/clients/dynamodb.js";

class EventDefService {
  private readonly table = envParsed().EVENTS_DEF_TABLE;
  private readonly PK = "EVENT_DEFINITION#";
  private readonly SK = "DEFINITION";

  constructor(private client: DocumentClient) {}

  async getAllEvents(): Promise<EventDef[]> {
    const params = {
      TableName: this.table,
      Key: {
        SK: this.SK,
      },
    };
    return (await this.client.query(params).promise()).Items as EventDef[];
  }

  async getEventByID(eventName: string, eventType: string): Promise<EventDef> {
    const params = {
      TableName: this.table,
      Key: {
        PK: `${this.PK}${eventType}${eventName}`,
        SK: this.SK,
        active: true,
      },
    };
    return (await this.client.get(params).promise()).Item as EventDef;
  }

  async createEvent(event: EventDef) {
    const params = {
      TableName: this.table,
      Item: {
        PK: `${this.PK}${event.event_type}${event.event_name}`,
        SK: this.SK,
        ...event,
        created_at: new Date().toISOString(),
      },
    };
    return this.client.put(params).promise();
  }

  async updateEvent(event: EventDef) {
    const params = {
      TableName: this.table,
      Key: {
        PK: `${this.PK}${event.event_type}`,
        SK: this.SK,
      },
      UpdateExpression: `SET 
            #updated_at = :updated_at,
            ${Object.keys(event)
              .map((key, index) => `#${key} = :value${index}`)
              .join(", ")}`,
      ExpressionAttributeNames: {
        "#updated_at": "updated_at",
        ...Object.keys(event).reduce(
          (acc, key, index) => ({
            ...acc,
            [`#${key}`]: key,
          }),
          {}
        ),
      },
      ExpressionAttributeValues: {
        ":updated_at": new Date().toISOString(),
        ...Object.keys(event).reduce(
          (acc, key, index) => ({
            ...acc,
            [`:value${index}`]: event[key],
          }),
          {}
        ),
      },
    };
    return this.client.update(params).promise();
  }
}

export { EventDefService };
