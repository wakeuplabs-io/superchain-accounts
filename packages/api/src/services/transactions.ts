import { zeroAddress } from "viem";
import { PrismaClient, Transaction } from "@prisma/client";
import { BundlerFactory, CHAIN_DATA } from "./bundler-factory";
import { ProviderFactory } from "./provider-factory";
import { Transaction as DomainTransaction } from "../domain/transaction";
import axios from "axios";

interface UserOperation {
  sender: string;
  nonce: string;
  factory?: string;
  factoryData?: string;
  initCode: string;
  callData: string;
  callGasLimit: string;
  verificationGasLimit: string;
  preVerificationGas: string;
  maxPriorityFeePerGas: string;
  maxFeePerGas: string;
  paymaster?: string;
  paymasterVerificationGasLimit?: string;
  paymasterData?: string | null;
  paymasterPostOpGasLimit?: string;
  signature: string;
}

export interface ITransactionService {
  sendUserOperation(
    operation: UserOperation,
    chainId: number
  ): Promise<Transaction>;
}

export class TransactionService {
  constructor(private repo: PrismaClient) {}

  async sendUserOperation(
    operation: UserOperation,
    chainId: number
  ): Promise<Transaction> {
    const { bundlerUrl, entryPoint } = CHAIN_DATA[chainId];
    const bundlerClient = BundlerFactory.getBundler(chainId);
    const { initCode: _, ...opData } = operation;

    try {
      const { data } = await axios.post(bundlerUrl, {
        jsonrpc: "2.0",
        method: "eth_sendUserOperation",
        params: [opData, entryPoint],
        id: 1,
      });

      if (!data.result) {
        throw Error("Transaction failed");
      }

      const { receipt } = await bundlerClient.waitForUserOperationReceipt({
        hash: data.result as `0x${string}`,
      });

      if (receipt.status !== "success") {
        throw Error("Transaction failed");
      }

      const providerClient = ProviderFactory.getProvider(chainId);
      const tx = await providerClient.getTransaction({
        hash: receipt.transactionHash,
      });

      return await this.repo.transaction.create({
        data: {
          hash: tx.hash as string,
          from: tx.from as string,
          to: tx.to ?? (zeroAddress as string),
          value: tx.value.toString() as string,
          data: tx.input as string,
          action: DomainTransaction.typeFromReceipt(receipt),
          chainId: chainId.toString(),
        },
      });
    } catch (error) {
      console.error(error);
      throw Error("Transaction failed");
    }
  }
}
