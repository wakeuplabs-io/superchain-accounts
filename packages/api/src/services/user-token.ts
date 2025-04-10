import { PrismaClient, UserToken } from "@prisma/client";
import tokenMetadata from "@/config/token-metadata.json";
import { GetUserTokensRequest, ImportUserTokenRequest } from "schemas";
import { Address, erc20Abi, getAddress, getContract, PublicClient } from "viem";
import { IClientFactory } from "./client-factory.js";

type TokenMetadataType = typeof tokenMetadata[keyof typeof tokenMetadata][number];

export interface IUserTokenService {
  getUserTokens(data: GetUserTokensRequest): Promise<UserToken[]>;
  importToken(data: ImportUserTokenRequest): Promise<UserToken>;
}

async function fetchUserTokenBalance(client: PublicClient, userToken: UserToken): Promise<bigint> {
  try {
    const balance = await client.readContract({
      address: getAddress(userToken.address),
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [getAddress(userToken.userWallet)],
    });  
    return balance;
  } catch (error) {
    console.error("Error getting balance", error);
    return 0n;
  }
}

export class UserTokenService implements IUserTokenService {
  constructor(private readonly db: PrismaClient, private readonly clientFactory: IClientFactory) {}
  
  async getUserTokens({ userWallet, chainId}: GetUserTokensRequest) {
    const userTokens = await this.db.userToken.findMany({
      where: {
        userWallet,
        chainId,
      },
    });

    return await this.populateTokensBalance(userTokens, chainId);
  }

  async populateTokensBalance(userTokens: UserToken[], chainId: number | undefined) {
    //TODO: IMPROVE THIS TO BE ABLE TO FETCH BALANCES FOR MULTIPLE CHAINS. FOR THE MOMENT RETURN ZERO FOR ALL TOKENS IF CHAINID IS NOT PROVIDED
    if(!chainId) {
      return userTokens.map(
        (token) => {
          return {
            ...token,
            balance: 0n,
          };
        }
      );
    }

    const client = this.clientFactory.getReadClient(chainId.toString());

    return Promise.all(userTokens.map(
      async (token) => {
        const balance = await fetchUserTokenBalance(client, token);
        return {
          ...token,
          balance: balance.toString(),
        };
      }
    ));
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