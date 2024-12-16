import AWS from "aws-sdk";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
});

const dynamodb = new AWS.DynamoDB();

const userTableParams: AWS.DynamoDB.CreateTableInput = {
  TableName: "Users",
  KeySchema: [
    { AttributeName: "PK", KeyType: "HASH" }, // Partition key
    { AttributeName: "SK", KeyType: "RANGE" }, // Sort key
  ],
  AttributeDefinitions: [
    { AttributeName: "PK", AttributeType: "S" },
    { AttributeName: "SK", AttributeType: "S" },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
};

const eventsTableParams: AWS.DynamoDB.CreateTableInput = {
  TableName: "Events",
  KeySchema: [
    { AttributeName: "PK", KeyType: "HASH" }, // Partition key
    { AttributeName: "SK", KeyType: "RANGE" }, // Sort key
  ],
  AttributeDefinitions: [
    { AttributeName: "PK", AttributeType: "S" },
    { AttributeName: "SK", AttributeType: "S" },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
};

const rewardsTableParams: AWS.DynamoDB.CreateTableInput = {
  TableName: "Rewards",
  KeySchema: [
    { AttributeName: "PK", KeyType: "HASH" }, // Partition key
    { AttributeName: "SK", KeyType: "RANGE" }, // Sort key
  ],
  AttributeDefinitions: [
    { AttributeName: "PK", AttributeType: "S" },
    { AttributeName: "SK", AttributeType: "S" },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
};

const milestonesTableParams: AWS.DynamoDB.CreateTableInput = {
  TableName: "Milestones",
  KeySchema: [
    { AttributeName: "PK", KeyType: "HASH" }, // Partition key
    { AttributeName: "SK", KeyType: "RANGE" }, // Sort key
  ],
  AttributeDefinitions: [
    { AttributeName: "PK", AttributeType: "S" },
    { AttributeName: "SK", AttributeType: "S" },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
};

const createTable = (params: AWS.DynamoDB.CreateTableInput) => {
  dynamodb.createTable(params, (err, data) => {
    if (err) {
      console.error(
        "Unable to create table. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      console.log(
        "Created table. Table description JSON:",
        JSON.stringify(data, null, 2)
      );
    }
  });
};

createTable(userTableParams);
createTable(eventsTableParams);
createTable(rewardsTableParams);
createTable(milestonesTableParams);
