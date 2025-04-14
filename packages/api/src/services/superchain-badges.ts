import { OWNER_PRIVATE_KEY } from "@/config/blockchain";
import { IClientFactory } from "./client-factory";
import superchainBadgesAbi from "@/config/abis/superchain-badges";
import { ISuperchainBadgesService } from "@/domain/badges";

export class SuperchainBadgesService implements ISuperchainBadgesService {
  constructor(
    private address: `0x${string}`,
    private clientFactory: IClientFactory
  ) {}

  async addClaimable(
    chainId: string,
    addresses: string[],
    tokenIds: bigint[]
  ): Promise<`0x${string}`> {
    const client = this.clientFactory.getWriteClient(
      chainId,
      OWNER_PRIVATE_KEY
    );

    const tx = await client.writeContract({
      address: this.address,
      abi: superchainBadgesAbi,
      functionName: "addClaimable",
      args: [addresses, tokenIds],
      chain: client.chain,
      account: client.account!,
    });

    return tx;
  }
}
