import envParsed from "@/envParsed.js";
import { DocumentClient } from "aws-sdk/clients/dynamodb.js";
import { Address } from "viem";

interface Network {
  address: `0x${string}`;
  chain: string;
}

interface UserItem {
  PK: string;
  SK: string;
  networks: Network[];
  name: string;
  address: string; // smart account
  superchain_points: number;
  email: string;
  nft_level: number;
  created_at: string;
}

class UserService {
  private readonly table = envParsed().USERS_TABLE;
  private readonly PK = "USER#";
  private readonly SK = "PROFILE";
  constructor(private client: DocumentClient) {}

  async getUserByArgs(args: { from: string; to: string }) {
    const params = {
      TableName: this.table,
      FilterExpression:
        "contains(networks.address, :from) or contains(networks.address, :to)",
      ExpressionAttributeValues: {
        ":from": args.from,
        ":to": args.to,
      },
    };
    const { Items } = await this.client.scan(params).promise();
    if (!Items || Items.length === 0) {
      throw new Error("User not found");
    }
    return Items[0] as UserItem;
  }

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

  async createUser(
    address: string,
    name: string,
    email: string,
    networks: Network[]
  ) {
    const params = {
      TableName: this.table,
      Item: {
        PK: `${this.PK}${address}`,
        SK: this.SK,
        networks,
        name,
        address,
        superchain_points: 0,
        email,
        nft_level: 1,
        created_at: new Date().toISOString(),
      } as UserItem,
    };
    await this.client.put(params).promise();
    return this.getUserById(address);
  }
}

export { UserService };
