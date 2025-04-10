import { PrismaClient, UserToken } from "@prisma/client";
import tokenMetadata from "@/config/token-metadata.json";
import { GetUserTokensRequest, ImportUserTokenRequest } from "schemas";
import { Address, erc20Abi, getContract } from "viem";
import { IClientFactory } from "./client-factory.js";

type TokenMetadataType = typeof tokenMetadata[keyof typeof tokenMetadata][number];

export interface IUserTokenService {
  getUserTokens(data: GetUserTokensRequest): Promise<UserToken[]>;
  importToken(data: ImportUserTokenRequest): Promise<UserToken>;
}

export class UserTokenService implements IUserTokenService {
  constructor(private readonly db: PrismaClient, private readonly clientFactory: IClientFactory) {}
  
  getUserTokens({ userWallet, chainId}: GetUserTokensRequest): Promise<UserToken[]> {
    return this.db.userToken.findMany({
      where: {
        userWallet,
        chainId,
      },
    });
  }

  async importToken(data: ImportUserTokenRequest) {
    const existingToken = await this.db.userToken.findFirst({
      where: {
        user: {
          wallet: data.userWallet,
        },
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
        user: {
          connectOrCreate: {
            where: {
              wallet: data.userWallet,
            },
            create: {
              wallet: data.userWallet,
            }
          }
        },
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
    const client = this.clientFactory.getReadClient(chainId.toString());

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