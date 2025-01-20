import { EventDefService } from "@/routes/events/mapping/service.js";
import { EventService } from "@/routes/events/service.js";
import { UserService } from "@/routes/users/service.js";
import { DynamoDBStreamEvent } from "aws-lambda";
import AWS from "aws-sdk";

const dynamoDb = new AWS.DynamoDB.DocumentClient();
interface EventData {
  from: string;
  to: string;
  value: number;
}

interface EventItem {
  PK: string;
  SK: string;
  event_type: string;
  event_name: string;
  chain: string;
  points_awarded: number;
  user_id: string;
  expires_on: number;
  data: EventData;
  created_at: string;
}

const eventDefService = new EventDefService(dynamoDb);
const eventService = new EventService(dynamoDb);

/**
 * This function processes deleted items from a DynamoDB stream.
 * @todo
 * It is pseudo-coded and must be thoroughly tested before delivery to production/staging.
 */
export const processDeletedItem = async (event: DynamoDBStreamEvent) => {
  console.log("Processing deleted item:", event);

  const records = event.Records;

  for (const record of records) {
    if (record.dynamodb && record.dynamodb.OldImage) {
      const deletedItem = AWS.DynamoDB.Converter.unmarshall(
        record.dynamodb.OldImage
      ) as Partial<EventItem>;

      if (
        !deletedItem.PK ||
        !deletedItem.SK ||
        !deletedItem.event_type ||
        !deletedItem.event_name ||
        !deletedItem.points_awarded ||
        !deletedItem.user_id
      ) {
        throw new Error("Missing required properties in deleted item");
      }
      console.log("Deleted Item:", JSON.stringify(deletedItem));
      const event = await eventDefService.getEventByID(
        deletedItem.event_name,
        deletedItem.event_type
      );
      await eventService.processEvent(event, deletedItem.user_id);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Item processed successfully" }),
  };
};
