import { UserToken } from "@prisma/client";
import { GetUserTokensRequest, ImportUserTokenRequest, Profile } from "schemas";
import { Address } from "viem";

export interface IUserTokenService {
  getUserTokens(data: GetUserTokensRequest): Promise<UserToken[]>;
  importToken(data: ImportUserTokenRequest): Promise<UserToken>;
}

export interface IUserService {
  getProfile(address: Address): Promise<Profile>;
}

export interface UserPosition {
  user: Address;
  totalPoints: number;
  current: number;
  total: number;
  percentile: number;
}

export interface UserRank {
  rank: string;
  minPoints: number;
  maxPoints?: number;
}

export const userRanks: UserRank[] = [
  {
    rank: "Superchain Sparrow",
    minPoints: 0,
    maxPoints: 1000,
  },
  {
    rank: "Superchain Panther",
    minPoints: 1001,
    maxPoints: 10000,
  },
  {
    rank: "Superchain Phoenix",
    minPoints: 10001,
  }
];