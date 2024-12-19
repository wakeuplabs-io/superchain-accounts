import { DynamoDBStreamEvent } from "aws-lambda";
import AWS from "aws-sdk";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

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
        record.dynamodb.OldImage,
      );
      console.log("Deleted Item:", JSON.stringify(deletedItem));

      // Extract relevant attributes from the deleted item
      const userId = deletedItem.userId;
      const eventType = deletedItem.event_type;

      //@todo calculate points rewards and milestones in a module and call it here
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Item processed successfully" }),
  };
};
