import { OWNER_PRIVATE_KEY } from "@/config/blockchain";
import { IClientFactory } from "./client-factory";
import superchainPointsAbi from "@/config/abis/superchain-points";
import { ISuperchainPointsService } from "@/domain/points";

export class SuperchainPointsService implements ISuperchainPointsService {
  constructor(
    private address: `0x${string}`,
    private clientFactory: IClientFactory
  ) {}

  async addClaimable(
    chainId: string,
    addresses: string[],
    amounts: bigint[]
  ): Promise<`0x${string}`> {
    const client = this.clientFactory.getWriteClient(
      chainId,
      OWNER_PRIVATE_KEY
    );

    // add 18 decimals to points
    const finalAmounts = amounts.map((amount) => amount * 1_000_000_000_000_000_000n);

    const tx = await client.writeContract({
      address: this.address,
      abi: superchainPointsAbi,
      functionName: "addClaimable",
      args: [addresses, finalAmounts],
      chain: client.chain,
      account: client.account!,
    });

    return tx;
  }
}
