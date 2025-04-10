import { Axios } from "axios";

export class TransactionService {
  constructor(private readonly axios: Axios) {}

  async sendUserOperation({
    chainId,
    operation,
  }: {
    chainId: string,
    operation: any
  }
  ) {
    const {data} = await this.axios.post(`/transactions/send`, {
      chainId,
      operation,
    });
    return data;
  }
}