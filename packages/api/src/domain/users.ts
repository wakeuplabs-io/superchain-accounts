import { UserToken } from "@prisma/client";
import { GetUserTokensRequest, ImportUserTokenRequest } from "schemas";

export interface IUserTokenService {
  getUserTokens(data: GetUserTokensRequest): Promise<UserToken[]>;
  importToken(data: ImportUserTokenRequest): Promise<UserToken>;
}
