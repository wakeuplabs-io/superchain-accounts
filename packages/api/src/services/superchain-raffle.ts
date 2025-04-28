import { CreateRaffleBody } from "schemas";
import { Address, encodePacked, getContract, keccak256, maxUint256, parseUnits, PublicClient, toHex, WalletClient } from "viem";
import { ISuperchainRaffleService } from "@/domain/raffle";
import { IClientFactory } from "./client-factory";
import superchainPointsAbi from "@/config/abis/superchain-points";
import superchainPointRaffleFactoryAbi from "@/config/abis/superchain-points-raffle-factory";
import superchainPointsRaffle from "@/config/abis/superchain-points-raffle";

export class SuperchainRaffleService implements ISuperchainRaffleService {
  constructor(
    private raffleFactoryAddress: Address,
    private superchainPointsAddress: Address,
    private ownerPrivateKey: Address,
    private clientFactory: IClientFactory
  ){}

  async createRaffle(data: CreateRaffleBody) {
    const readClient = this.clientFactory.getReadClient(data.chainId.toString());
    const writeClient = this.clientFactory.getWriteClient(data.chainId.toString(), this.ownerPrivateKey);

    const pointsToken = this.getPointsTokenContract(readClient, writeClient);
    const raffleFactory = this.getRaffleFactoryContract(readClient, writeClient);

    const raffleOwner = await raffleFactory.read.owner() as Address;
    const pointsTokenDecimals = await pointsToken.read.decimals() as number;
    const jackpot = parseUnits(data.jackpot.toString(), pointsTokenDecimals); 

    // Mint points for raffle owner
    await pointsToken.write.mint(
      [raffleOwner, jackpot],
    );

    //create raffle
    await raffleFactory.write.createRaffle();
    const currentRaffleAddress = await raffleFactory.read.currentRaffle() as Address;

    await pointsToken.write.approve([currentRaffleAddress, maxUint256]);

    //create seed
    const seed = toHex(crypto.getRandomValues(new Uint8Array(32)));

    //initialize raffle
    await writeClient.writeContract({
      chain: writeClient.chain,
      account: writeClient.account!,
      address: currentRaffleAddress,
      abi: superchainPointsRaffle,
      functionName: "initialize",
      args: [
        keccak256(encodePacked(
          ["address", "bytes32"],
          [raffleOwner, seed]
        )),
        BigInt(Math.floor(data.revealAfter.getTime() / 1000)),
        jackpot,
        data.badges, 
        data.badgeAllocations,
      ],
    });

    return {
      address: currentRaffleAddress,
      seed,
    };
  }

  private getPointsTokenContract(readClient: PublicClient, writeClient: WalletClient) {
    return getContract(
      {
        address: this.superchainPointsAddress,
        abi:superchainPointsAbi,
        client: {public: readClient, wallet: writeClient},
      });
  }

  private getRaffleFactoryContract(readClient: PublicClient, writeClient: WalletClient) {
    return getContract(
      {
        address: this.raffleFactoryAddress,
        abi: superchainPointRaffleFactoryAbi,
        client: {public: readClient, wallet: writeClient},
      });
  }
}