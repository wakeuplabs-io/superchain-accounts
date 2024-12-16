import { DynamoDBStreamEvent } from "aws-lambda";
import AWS from "aws-sdk";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

/**
 * This function processes deleted items from a DynamoDB stream.
 * It is pseudo-coded and must be thoroughly tested before delivery to production/staging.
 */
export const processDeletedItem = async (event: DynamoDBStreamEvent) => {

  const records = event.Records;

  for (const record of records) {
    if (record.dynamodb && record.dynamodb.OldImage) {
      const deletedItem = AWS.DynamoDB.Converter.unmarshall(
        record.dynamodb.OldImage
      );

      // Extract relevant attributes from the deleted item
      const userId = deletedItem.userId;
      const eventType = deletedItem.event_type;

      // Example conditions (replace with your actual logic)
      if (eventType === "someEventType") {
        // Grant points
        await grantPoints(userId, 10);
      } else if (eventType === "anotherEventType") {
        // Grant rewards
        await grantRewards(userId, "rewardId");
      } else if (eventType === "yetAnotherEventType") {
        // Grant milestones
        await grantMilestones(userId, "milestoneId");
      }
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Item processed successfully" }),
  };
};

// Example functions to grant points, rewards, and milestones
const grantPoints = async (userId: string, points: number) => {
  // Logic to grant points
  console.log(`Granting ${points} points to user ${userId}`);
  // Update the user's points in DynamoDB or perform other actions
};

const grantRewards = async (userId: string, rewardId: string) => {
  // Logic to grant rewards
  console.log(`Granting reward ${rewardId} to user ${userId}`);
  // Update the user's rewards in DynamoDB or perform other actions
};

const grantMilestones = async (userId: string, milestoneId: string) => {
  // Logic to grant milestones
  console.log(`Granting milestone ${milestoneId} to user ${userId}`);
  // Update the user's milestones in DynamoDB or perform other actions
};
