import { zeroAddress } from "viem";
import { PrismaClient, Transaction } from "@prisma/client";
import { BundlerFactory, BUNDLERS_URLS } from "./bundler-factory.js";
import { ProviderFactory } from "./provider-factory.js";
import { Transaction as DomainTransaction } from "../domain/transaction.js";
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

export class TransactionService {
  constructor(private repo: PrismaClient) {}

  async sendUserOperation(
    operation: UserOperation,
    chainId: number
  ): Promise<Transaction> {
    const bundlerClient = BundlerFactory.getBundler(chainId);
    const {initCode, ...opData} = operation

    try {
      const { data } = await axios.post(BUNDLERS_URLS[chainId], {
      jsonrpc: "2.0",
      method: "eth_sendUserOperation",
      params: [opData, "0x0000000071727De22E5E9d8BAf0edAc6f37da032"],
      id: 1,
    });

    if (!data.result) {
      throw Error("Transaction failed");
    }

    const {receipt} = await bundlerClient.waitForUserOperationReceipt({
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
      },
    });

    } catch (error) {
      console.error(error)
      throw Error("Transaction failed");
    }
  }
}
