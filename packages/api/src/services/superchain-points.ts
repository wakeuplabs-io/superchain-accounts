import { OWNER_PRIVATE_KEY } from "@/config/blockchain";
import { IClientFactory } from "./client-factory";
import superchainPointsAbi from "@/config/abis/superchain-points";
import { ISuperchainPointsService } from "@/domain/points";
import { formatUnits } from "viem";

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

    const finalAmounts = amounts.map((amount) => formatUnits(amount, 18));

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
