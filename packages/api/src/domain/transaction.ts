import { Transaction, TransactionAction } from "@prisma/client";
import { Address, TransactionReceipt } from "viem";

export interface UserOperation {
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
    chainId: string
  ): Promise<Transaction>;

  typeFromReceipt(tx: {
    to: Address;
    data: `0x${string}`;
    value: bigint;
    logs: TransactionReceipt["logs"];
  }): TransactionAction;
}
