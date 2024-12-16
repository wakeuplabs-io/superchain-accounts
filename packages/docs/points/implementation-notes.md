# Superchain Points Implementation Notes

## Stack Architecture

### Lambda Functions

- **processNewUserAccount**: Handles new user registration
- **processBlockchainEvent**: Processes blockchain events
- **processTimeframeEvent**: Processes timeframe-based events

### DynamoDB Tables

[Your existing tables documentation here...]

### Event Flow

1. **User Registration**

   - Endpoint: POST /users
   - Creates entry in Users table
   - Triggers initial milestone creation

2. **Blockchain Events**

   - Endpoint: POST /process-blockchain-event
   - Logs event in Events table
   - Updates user points
   - Checks for milestone completion

3. **Timeframe Events**
   - Triggered by DynamoDB TTL
   - Processes expired timeframe events
   - Updates points and milestones

## Implementation Details

### Serverless Configuration

- Region: sa-east-1
- Runtime: nodejs20.x
- Custom domain: api.superchain-points.optimism.io

### Key Functions

1. **User Management**

   - Create user
   - Update points
   - Check milestone progress

2. **Event Processing**

   - Log events
   - Award points
   - Update milestones

3. **Reward System**
   - Track point accumulation
   - Process milestone completion
   - Handle reward distribution

## Deployment Notes

### Prerequisites

- AWS CLI configured
- Node.js 20.x
- Serverless Framework

### Deployment Commands

```bash
pnpm install
pnpm run package:api --stage=staging
pnpm run deploy:api --stage=staging

```

# implementation-db

# Superchain Points Flow for DynamoDB

This document outlines the data flow, event subscriptions, and DynamoDB table design required to implement the Superchain Points system using viem and DynamoDB.

---

## 1. DynamoDB Table Design

### **1. Users Table**

Stores user-level information like wallet address, points, and NFT details.

| **Attribute Name**  | **Type**       | **Description**                                   |
| ------------------- | -------------- | ------------------------------------------------- |
| `PK`                | `string`       | **Partition Key**: `USER#{smartContractAddress}`. |
| `SK`                | `string`       | **Sort Key**: Always set to `PROFILE`.            |
| `wallet_address`    | `string`       | Wallet address of the user.                       |
| `superchain_points` | `number`       | Total points earned by the user.                  |
| `nft_level`         | `number`       | Current NFT level (e.g., 1, 2, 3, 4).             |
| `created_at`        | `string (ISO)` | ISO timestamp for when the user was created.      |

---

### **2. Events Table**

Logs all user events and activities for tracking and auditing.

| **Attribute Name** | **Type**       | **Description**                               |
| ------------------ | -------------- | --------------------------------------------- |
| `PK`               | `string`       | **Partition Key**: `EVENT#{userAddress}`.     |
| `SK`               | `string`       | **Sort Key**: `TIMESTAMP#{eventTimestamp}`.   |
| `event_type`       | `string`       | The type of event (e.g., `Transfer`, `Vote`). |
| `chain`            | `string`       | The chain where the event occurred.           |
| `data`             | `map`          | Event metadata (e.g., amount, tokenId, etc).  |
| `points_awarded`   | `number`       | Points awarded for the event.                 |
| `created_at`       | `string (ISO)` | ISO timestamp for when the event was logged.  |

---

### **3. Rewards Table**

Stores data for rewards issued to users, such as points or NFT claims.

| **Attribute Name** | **Type**       | **Description**                               |
| ------------------ | -------------- | --------------------------------------------- |
| `PK`               | `string`       | **Partition Key**: `REWARD#{userAddress}`.    |
| `SK`               | `string`       | **Sort Key**: `REWARD#{rewardId}`.            |
| `reward_type`      | `string`       | Type of reward (e.g., Points, NFT, etc.).     |
| `amount`           | `number`       | The amount of the reward.                     |
| `claimed`          | `boolean`      | Whether the reward has been claimed.          |
| `created_at`       | `string (ISO)` | ISO timestamp for when the reward was issued. |

---

### **4. Milestones Table**

Tracks user progress toward specific milestones.

| **Attribute Name** | **Type**       | **Description**                                   |
| ------------------ | -------------- | ------------------------------------------------- |
| `PK`               | `string`       | **Partition Key**: `MILESTONE#{userAddress}`.     |
| `SK`               | `string`       | **Sort Key**: `MILESTONE#{milestoneType}`.        |
| `milestone_type`   | `string`       | The type of milestone (e.g., `Transactions`).     |
| `progress`         | `number`       | Current progress for this milestone.              |
| `target`           | `number`       | Target value required to complete milestone.      |
| `completed`        | `boolean`      | Whether the milestone has been completed.         |
| `created_at`       | `string (ISO)` | ISO timestamp for when the milestone was created. |

---

### ** 5 EVENT_DEFINITION Table **

| **Attribute Name**   | **Type**       | **Description**                                             |
| -------------------- | -------------- | ----------------------------------------------------------- |
| `PK`                 | `string`       | **Partition Key**: `EVENT_DEFINITION#{eventType}`           |
| `SK`                 | `string`       | **Sort Key**: Always set to `DEFINITION`                    |
| `event_type`         | `string`       | The unique identifier of the event type                     |
| `event_trigger_type` | `string`       | The type of trigger for the event (blockchain or timeframe) |
| `expires_on_ttl`     | `number`       | the TTL to be set in case event is timeframe                |
| `event_name`         | `string`       | Human-readable name of the event type                       |
| `points_awarded`     | `number`       | Number of points awarded for triggering this event          |
| `description`        | `string`       | Detailed description of the event and its criteria          |
| `active`             | `boolean`      | Flag indicating whether the event type is currently active  |
| `created_at`         | `string (ISO)` | Timestamp of when the event definition was created          |
| `updated_at`         | `string (ISO)` | Timestamp of the last update to the event definition        |

---

### ** 6 REWARD_DEFINITION Table**

| Attribute Name       | Type           | Description                                                 |
| -------------------- | -------------- | ----------------------------------------------------------- |
| `PK`                 | `string`       | **Partition Key**: `REWARD_DEFINITION#{rewardType}`         |
| `SK`                 | `string`       | **Sort Key**: Always set to `DEFINITION`                    |
| `reward_type`        | `string`       | Unique identifier of the reward type                        |
| `reward_name`        | `string`       | Human-readable name of the reward type                      |
| `reward_description` | `string`       | Detailed description of the reward and its criteria         |
| `reward_value`       | `number`       | Value of the reward (e.g., points, NFT)                     |
| `active`             | `boolean`      | Flag indicating whether the reward type is currently active |
| `created_at`         | `string (ISO)` | Timestamp of when the reward definition was created         |
| `updated_at`         | `string (ISO)` | Timestamp of the last update to the reward definition       |

### ** 7 MILESTONE_DEFINITION Table**

| Attribute Name          | Type           | Description                                                                           |
| ----------------------- | -------------- | ------------------------------------------------------------------------------------- |
| `PK`                    | `string`       | **Partition Key**: `MILESTONE_DEFINITION#{milestoneType}`                             |
| `SK`                    | `string`       | **Sort Key**: Always set to `DEFINITION`                                              |
| `milestone_type`        | `string`       | Unique identifier of the milestone type                                               |
| `milestone_name`        | `string`       | Human-readable name of the milestone type                                             |
| `milestone_description` | `string`       | Detailed description of the milestone and its criteria                                |
| `milestone_target`      | `number`       | Target value required to complete the milestone                                       |
| `reward_type`           | `string`       | Reward type associated with completing the milestone (references `REWARD_DEFINITION`) |
| `active`                | `boolean`      | Flag indicating whether the milestone type is currently active                        |
| `created_at`            | `string (ISO)` | Timestamp of when the milestone definition was created                                |
| `updated_at`            | `string (ISO)` | Timestamp of the last update to the milestone definition                              |

### ** 8 TIMEFRAME_EVENTS_CRON **

| Attribute Name    | Type           | Description                                                   |
| ----------------- | -------------- | ------------------------------------------------------------- |
| `PK`              | `string`       | **Partition Key**: `TIMEFRAME_EVENT_LOG#{eventType}`          |
| `SK`              | `string`       | **Sort Key**: `USER#{userAddress}#TIMESTAMP#{eventTimestamp}` |
| `event_type`      | `string`       | The type of the timeframe-based event                         |
| `user_address`    | `string`       | Wallet address of the user who triggered the event            |
| `event_timestamp` | `string (ISO)` | Timestamp of the event                                        |
| `data`            | `map`          | Event metadata (e.g., amount, tokenId, etc.)                  |
| `points_awarded`  | `number`       | Points awarded for the event                                  |
| `claimed`         | `boolean`      | Whether the reward for this event has been claimed            |
| `expires_on_ttl`  | `number`       | Unix timestamp indicating when the item should be expired     |

## 2. Database Logic and Queries

### **1. Writing Points for Events**

When an event is detected, log it in the `Events` table and update the user's points in the `Users` table.

#### **Example Query: Logging an Event**

```javascript
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const logEvent = async (userAddress, eventType, chain, points, metadata) => {
  const client = new DynamoDBClient();
  const command = new PutItemCommand({
    TableName: "Events",
    Item: {
      PK: { S: `EVENT#${userAddress}` },
      SK: { S: `TIMESTAMP#${new Date().toISOString()}` },
      event_type: { S: eventType },
      chain: { S: chain },
      points_awarded: { N: `${points}` },
      data: { M: metadata }, // Pass event-specific data as a map
      created_at: { S: new Date().toISOString() },
    },
  });

  await client.send(command);
};
```
