import { Axios } from "axios";
import { ImportUserTokenRequest, UserToken } from "schemas";

export class TokenService  {
  constructor(private readonly axios: Axios) {}

  async importToken(request: ImportUserTokenRequest): Promise<UserToken>  {
    const { data } = await this.axios.post<UserToken>("/token/import", request);
    
    return data;
  }
}