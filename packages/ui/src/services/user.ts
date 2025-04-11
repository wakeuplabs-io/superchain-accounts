import { Axios } from "axios";
import { GetUserTokensRequest, GetUserTokensResponse, getUserTokensResponseScheme, ImportUserTokenRequest, UserToken } from "schemas";

export class UserService  {
  constructor(private readonly axios: Axios) {}

  async getUserTokens({userWallet, ...params}: GetUserTokensRequest): Promise<GetUserTokensResponse>  {
    const { data } = await this.axios.get<GetUserTokensResponse>(`/users/${userWallet}/tokens`, { params });

    return getUserTokensResponseScheme.parse(data);
  }

  async importToken(request: ImportUserTokenRequest): Promise<UserToken>  {
    const { data } = await this.axios.post<UserToken>(`/users/${request.userWallet}/tokens`, request);
    
    return data;
  }
}