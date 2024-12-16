import { APIGatewayProxyHandler } from "aws-lambda";
import AWS from "aws-sdk";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

/**
 * This function processes a blockchain event and stores it in the database.
 * It is pseudo-coded and must be thoroughly tested before delivery to production/staging.
 */

export const processBlockchainEvent: APIGatewayProxyHandler = async (event) => {
  try {
    // Parse the request body
    const requestBody = JSON.parse(event.body || "{}");

    // Extract relevant attributes from the request body
    const userId = requestBody.userId;
    const eventType = requestBody.event_type;
    const chain = requestBody.chain;
    const data = requestBody.data;
    const pointsAwarded = requestBody.points_awarded;
    const eventTimestamp = new Date().toISOString();

    // Validate the input
    if (!userId || !eventType || !chain) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "userId, event_type, and chain are required",
        }),
      };
    }

    // Define the parameters for the DynamoDB put operation
    const params = {
      TableName: process.env.EVENTS_TABLE || "Events-Staging",
      Item: {
        PK: `EVENT#${userId}`,
        SK: `TIMESTAMP#${eventTimestamp}`,
        event_type: eventType,
        chain: chain,
        data: data,
        points_awarded: pointsAwarded,
        created_at: eventTimestamp,
      },
    };

    // Perform the put operation to insert the new event
    await dynamoDb.put(params).promise();

    // Return a success response
    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Blockchain event processed successfully",
      }),
    };
  } catch (error) {
    // Handle any errors
    console.error("Error processing blockchain event:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not process blockchain event" }),
    };
  }
};
