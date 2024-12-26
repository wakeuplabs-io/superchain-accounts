import { Address, formatEther, PublicClient } from "viem";

export class Web3Client {
  constructor(private readonly publicClient: PublicClient) {}

  async getBalance(address: Address): Promise<string> {
    const balance = await this.publicClient.getBalance({address});

    return formatEther(balance);
  }
}