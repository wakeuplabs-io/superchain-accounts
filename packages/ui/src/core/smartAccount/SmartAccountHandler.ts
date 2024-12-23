import { Address, http, PublicClient } from "viem";
import { toSimpleSmartAccount, ToSimpleSmartAccountParameters } from "permissionless/accounts";
import {
  BundlerClient,
  createBundlerClient,
  EntryPointVersion,
  PaymasterClient,
  SmartAccount,
  UserOperationCall,
} from "viem/account-abstraction";


export class SmartAccountHandler {
  private readonly bundlerClient: BundlerClient;

  constructor(
    private readonly publicClient: PublicClient,
    private readonly entryPointAddress: Address,
    private readonly smartAccountFactoryAddress: Address,
    bundlerUrl: string,
    paymaster: PaymasterClient,
  ) {
    this.bundlerClient = createBundlerClient({
      chain: this.publicClient.chain,
      transport: http(bundlerUrl),
      paymaster,
    });
  }

  async getSmartAccount(owner: ToSimpleSmartAccountParameters<EntryPointVersion>["owner"]): Promise<SmartAccount> {
    return toSimpleSmartAccount({
      owner,
      client: this.publicClient,
      factoryAddress: this.smartAccountFactoryAddress,
      entryPoint: {
        address: this.entryPointAddress,
        version: "0.7",
      },
    });
  }

  async sendTransaction(account: SmartAccount, transaction: UserOperationCall) {
    //TODO: INVESTIGATE THOSE GAS MAGIC NUMBERS
    const hash = await this.bundlerClient.sendUserOperation({
      account,
      calls: [transaction],
      maxPriorityFeePerGas: 1000304n,
      maxFeePerGas: 1000304n,
      paymasterVerificationGasLimit: 1000304n,
    });

    const receipt = await this.bundlerClient.getUserOperationReceipt({ hash });

    console.log("Transaction receipt:", receipt);
  }
}
