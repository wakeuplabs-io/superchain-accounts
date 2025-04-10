import { Axios } from "axios";
import { GetUserTokensRequest, ImportUserTokenRequest, UserToken } from "schemas";

export class UserService  {
  constructor(private readonly axios: Axios) {}

  async getUserTokens({userWallet, ...params}: GetUserTokensRequest): Promise<UserToken[]>  {
    const { data } = await this.axios.get<UserToken[]>(`/users/${userWallet}/tokens`, { params });

    return data;
  }

  async importToken(request: ImportUserTokenRequest): Promise<UserToken>  {
    const { data } = await this.axios.post<UserToken>(`/users/${request.userWallet}/tokens`, request);
    
    return data;
  }
}