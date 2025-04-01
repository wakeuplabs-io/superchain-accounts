import { PrismaClient, Transaction, TransactionAction } from "@prisma/client";
import { BundlerClient, UserOperation } from "viem/account-abstraction";
import { BundlerFactory } from "./bundler-factory.js";
import { ProviderFactory } from "./provider-factory.js";
import { zeroAddress } from "viem";
import { Transaction as DomainTransaction } from "../domain/transaction.js";

export class TransactionService {
  constructor(private repo: PrismaClient) {}

  async sendUserOperation(
    operation: UserOperation,
    chainId: number
  ): Promise<Transaction> {
    const bundlerClient = BundlerFactory.getBundler(chainId);

    const hash = await bundlerClient.sendUserOperation(operation);
    const receipt = await bundlerClient.waitForUserOperationReceipt({
      hash,
    });
    if (receipt.success) {
      throw Error("Transaction failed");
    }

    const providerClient = ProviderFactory.getProvider(chainId);
    const tx = await providerClient.getTransaction({
      hash: receipt.receipt.transactionHash,
    });

    return await this.repo.transaction.create({
      data: {
        hash: tx.hash as string,
        from: tx.from as string,
        to: tx.to ?? (zeroAddress as string),
        value: tx.value.toString() as string,
        data: tx.input as string,
        action: DomainTransaction.typeFromReceipt(receipt.receipt),
      },
    });
  }
}
