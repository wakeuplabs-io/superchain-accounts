import { Address, formatEther, PublicClient } from "viem";


// TODO: should we really need a class for this? could it be a better approach to use a custom hook??

export class Web3Client {
  constructor(private readonly publicClient: PublicClient) {}

  async getBalance(address: Address): Promise<string> {
    const balance = await this.publicClient.getBalance({address});

    return formatEther(balance);
  }
}