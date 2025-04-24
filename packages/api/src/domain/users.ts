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