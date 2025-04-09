import { PrismaClient } from "@prisma/client";
import tokenMetadata from "./token-metadata.json" with { type: "json" };
import { ImportUserTokenRequest } from "schemas";
import { ProviderFactory } from "./provider-factory.js";
import { Address, getContract } from "viem";

type TokenMetadataType = typeof tokenMetadata[keyof typeof tokenMetadata][number];

const erc20Abi = [
  { name: "name", type: "function", stateMutability: "view", outputs: [{ type: "string" }], inputs: [] },
  { name: "symbol", type: "function", stateMutability: "view", outputs: [{ type: "string" }], inputs: [] },
  { name: "decimals", type: "function", stateMutability: "view", outputs: [{ type: "uint8" }], inputs: [] },
];

export class TokenService {
  constructor(private readonly db: PrismaClient) {}

  async importToken(data: ImportUserTokenRequest) {
    const existingToken = await this.db.userToken.findFirst({
      where: {
        userAddress: data.userAddress,
        address: data.address,
        chainId: data.chainId,
      }
    });

    if (existingToken) {
      throw new Error("Token already imported by user");
    }

    const tokenData = await this.getTokenData(data.chainId, data.address);

    const tokenMetadata = this.getTokenMetadata(data.chainId, tokenData.symbol);

    const userToken = await this.db.userToken.create({
      data: {
        userAddress: data.userAddress,
        address: data.address,
        chainId: data.chainId,
        name: tokenData.name,
        symbol: tokenData.symbol,
        decimals: tokenData.decimals,
        logoURI: tokenMetadata?.logoURI,
      },
    });

    return userToken;
  }

  private async getTokenData(chainId: number, address: Address) {
    const client = ProviderFactory.getProvider(chainId);

    const contract = getContract({
      address,
      abi: erc20Abi,
      client,
    });

    try {
      const [name, symbol, decimals] = await Promise.all([
        contract.read.name(),
        contract.read.symbol(),
        contract.read.decimals(),
      ]);

      return {
        name: String(name),
        symbol: String(symbol),
        decimals: Number(decimals),
      };
    } catch (error) {
      console.error(error);
      throw new Error("This address is not a valid ERC-20 token");
    }
  }

  private getTokenMetadata(chainId: number, symbol: string): TokenMetadataType | null | undefined {
    const chainTokens = tokenMetadata[chainId.toString() as keyof typeof tokenMetadata];
    if (!chainTokens) {
      return null;
    }

    return chainTokens.find(token => token.symbol === symbol);
  }
}