import { Axios } from "axios";
import { ImportUserTokenRequest, UserToken } from "schemas";

export class UserService  {
  constructor(private readonly axios: Axios) {}

  async importToken(request: ImportUserTokenRequest): Promise<UserToken>  {
    const { data } = await this.axios.post<UserToken>(`/users/${request.userAddress}/tokens`, request);
    
    return data;
  }
}