import { Axios } from "axios";
import {
  GetUserTokensRequest,
  GetUserTokensResponse,
  getUserTokensResponseScheme,
  ImportUserTokenRequest,
  Profile,
  UserToken,
} from "schemas";
import { Address } from "viem";

export const userRanks = [
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
    maxPoints: undefined,
  },
] as const;

export class UserService {
  constructor(private readonly axios: Axios) {}

  async getUserTokens({
    userWallet,
    ...params
  }: GetUserTokensRequest): Promise<GetUserTokensResponse> {
    const { data } = await this.axios.get<GetUserTokensResponse>(
      `/users/${userWallet}/tokens`,
      { params }
    );

    return getUserTokensResponseScheme.parse(data);
  }

  async importToken(request: ImportUserTokenRequest): Promise<UserToken> {
    const { data } = await this.axios.post<UserToken>(
      `/users/${request.userWallet}/tokens`,
      request
    );

    return data;
  }

  async getProfile(wallet: Address): Promise<Profile> {
    const { data: response } = await this.axios.get(`/users/${wallet}/profile`);

    if (!response) {
      throw new Error("User not found");
    }

    return response.data.profile as Profile;
  }
}
