/* eslint-disable @typescript-eslint/no-explicit-any */
import { Axios } from "axios";
import { Hex } from "viem";

export class TransactionService {
  constructor(private readonly axios: Axios) {}

  async sendUserOperation({
    chainId,
    operation,
  }: {
    chainId: string,
    operation: any
  }
  ): Promise<Hex> {
    const {data: response} = await this.axios.post("/transactions/send", {
      chainId,
      operation,
    });

    return response.data.transaction.hash as Hex;
  }
}