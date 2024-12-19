import { APIGatewayProxyHandler } from "aws-lambda";
import AWS from "aws-sdk";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

/**
 * This function creates a new user account in the database.
 * It is pseudo-coded and must be thoroughly tested before delivery to production/staging.
 */
export const createUserAccount: APIGatewayProxyHandler = async (event) => {
  try {
    // Parse the request body
    const requestBody = JSON.parse(event.body || "{}");

    // Extract relevant attributes from the request body
    const userId = requestBody.userId;
    const walletAddress = requestBody.wallet_address;
    const superchainPoints = requestBody.superchain_points;
    const nftLevel = requestBody.nft_level;
    const createdAt = new Date().toISOString();

    // Validate the input
    if (!userId || !walletAddress) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "userId and wallet_address are required",
        }),
      };
    }

    // Define the parameters for the DynamoDB put operation
    const params = {
      TableName: process.env.USERS_TABLE || "Users-Staging",
      Item: {
        PK: `USER#${userId}`,
        SK: "PROFILE",
        wallet_address: walletAddress,
        superchain_points: superchainPoints,
        nft_level: nftLevel,
        created_at: createdAt,
      },
    };

    // Perform the put operation to insert the new user account
    await dynamoDb.put(params).promise();

    // Return a success response
    return {
      statusCode: 201,
      body: JSON.stringify({ message: "User account created successfully" }),
    };
  } catch (error) {
    // Handle any errors
    console.error("Error creating user account:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not create user account" }),
    };
  }
};
