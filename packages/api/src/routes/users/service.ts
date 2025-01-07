import envParsed from "@/envParsed.js";
import { DocumentClient } from "aws-sdk/clients/dynamodb.js";

class UserService {
  private readonly table = envParsed().USERS_TABLE;
  private readonly PK = "USER#";
  private readonly SK = "PROFILE";
  constructor(private client: DocumentClient) {}

  async getUserById(address: string) {
    const params = {
      TableName: this.table,
      Key: {
        PK: `${this.PK}${address}`,
        SK: this.SK,
      },
    };
    return (await this.client.get(params).promise()).Item;
  }

  async createUser(address: string, name: string, email: string) {
    const params = {
      TableName: this.table,
      Item: {
        PK: `${this.PK}${address}`,
        SK: this.SK,
        name,
        address,
        superchain_points: 0,
        email,
        nft_level: 1,
        created_at: new Date().toISOString(),
      },
    };
    return this.client.put(params).promise();
  }
}

export { UserService };
