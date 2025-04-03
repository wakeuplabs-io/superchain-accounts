import { TransactionAction } from "@prisma/client";
import { decodeEventLog, erc20Abi, TransactionReceipt } from "viem";

export class Transaction {
  static typeFromReceipt(receipt: TransactionReceipt): TransactionAction {
    const transferLogs = receipt.logs.filter((log) => {
      try {
        const decoded = decodeEventLog({
          abi: erc20Abi,
          data: log.data,
          topics: log.topics,
          eventName: "Transfer",
        });
        return !!decoded;
      } catch {
        return false;
      }
    });

    if (transferLogs.length === 1) {
      return TransactionAction.TRANSFER;
    } else if (transferLogs.length > 2) {
      return TransactionAction.SWAP;
    } else {
      return TransactionAction.UNKNOWN;
    }
  }
}
