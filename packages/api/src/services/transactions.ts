import {
  Address,
  decodeEventLog,
  decodeFunctionData,
  erc20Abi,
  parseAbi,
  TransactionReceipt,
} from "viem";
import { PrismaClient, Transaction, TransactionAction } from "@prisma/client";
import { IBundlerFactory } from "./bundler-factory";
import axios from "axios";
import { SMART_ACCOUNTS } from "@/config/blockchain";
import { ITransactionService, UserOperation } from "@/domain/transaction";
import envParsed from "@/envParsed";

export class TransactionService implements ITransactionService {
  constructor(
    private repo: PrismaClient,
    private bundlerFactory: IBundlerFactory
  ) {}

  async sendUserOperation(
    operation: UserOperation,
    chainId: string
  ): Promise<Transaction> {
    const { bundlerUrl, entryPoint } = SMART_ACCOUNTS[chainId];
    const bundlerClient = this.bundlerFactory.getBundler(chainId);
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

      const { receipt, logs } = await bundlerClient.waitForUserOperationReceipt(
        {
          hash: data.result as `0x${string}`,
        }
      );


      if (receipt.status !== "success") {
        throw Error("Transaction failed");
      }

      const decoded = decodeFunctionData({
        abi: parseAbi([
          "function executeUserOpWithErrorString(address to, uint256 value, bytes data, uint8 operation)",
        ]),
        data: opData.callData as `0x${string}`,
      });


      return await this.repo.transaction.create({
        data: {
          hash: receipt.transactionHash,
          from: opData.sender as string,
          to: decoded.args[0],
          value: "0x" + decoded.args[1].toString(16),
          data: decoded.args[2],
          action: this.typeFromReceipt({
            to: decoded.args[0],
            data: decoded.args[2],
            value: decoded.args[1],
            logs,
          }),
          chainId: chainId.toString(),
        },
      });
    } catch (error) {
      console.error(error);
      throw Error("Transaction failed");
    }
  }

  typeFromReceipt({
    to,
    data,
    value,
    logs,
  }: {
    to: Address;
    data: `0x${string}`;
    value: bigint;
    logs: TransactionReceipt["logs"];
  }): TransactionAction {
    if (to === envParsed().SUPERCHAIN_POINTS_ADDRESS) {
      try {
        decodeFunctionData({
          abi: parseAbi(["function claim()"]),
          data,
        });

        return TransactionAction.ClaimPoints;
      } catch {}
    }

    if (to === envParsed().SUPERCHAIN_BADGES_ADDRESS) {
      try {
        decodeFunctionData({
          abi: parseAbi(["function claim(uint256 tokenId)"]),
          data,
        });

        return TransactionAction.ClaimBadge;
      } catch {}
    }

    if (value !== 0n && data === "0x") {
      return TransactionAction.Transfer;
    }

    const transferLogs = logs.filter((log) => {
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
      return TransactionAction.Transfer;
    } else if (transferLogs.length > 2) {
      return TransactionAction.Swap;
    }

    return TransactionAction.Unknown;
  }
}
