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
  private bundlerClient: BundlerClient | null = null;
  private smartAccount: SmartAccount | null = null;

  constructor(
    private readonly publicClient: PublicClient,
    private readonly entryPointAddress: Address,
    private readonly smartAccountFactoryAddress: Address,
    private readonly bundlerUrl: string,
    private readonly paymaster: PaymasterClient,
  ) {}

  getSmartAccount(): SmartAccount | null {
    return this.smartAccount;
  }

  async initialize(owner: ToSimpleSmartAccountParameters<EntryPointVersion>["owner"]): Promise<SmartAccount> {
    this.smartAccount = await toSimpleSmartAccount({
      owner,
      client: this.publicClient,
      factoryAddress: this.smartAccountFactoryAddress,
      entryPoint: {
        address: this.entryPointAddress,
        version: "0.7",
      },
    });

     if(!this.smartAccount) { 
      throw Error("Smart account not initialized");
    }
    
    //initialize bundler client
    this.bundlerClient = createBundlerClient({
      account: this.smartAccount,
      chain: this.publicClient.chain,
      transport: http(this.bundlerUrl),
      paymaster: this.paymaster,
    });

    return this.smartAccount;
  }

  async deploySmartAccount() {
    if(!this.smartAccount) { 
      throw Error("Smart account not initialized");
    }

    const isDeployed = await this.smartAccount.isDeployed();

    if(isDeployed) {
      return;
    }

    console.log("Deploying smart account", this.smartAccount.address);
    // Send a user operation to the bundler to deploy the smart account
    const transaction = {
      to: this.smartAccount.address,
      value: BigInt(0),
    };
    
    await this.sendTransaction(transaction);
  }

  async sendTransaction(transaction: UserOperationCall) {
    console.log("Sending transaction", transaction);
    if (!this.bundlerClient) {
      throw Error("Bundler client not initialized");
    }

    //TODO: INVESTIGATE THOSE GAS MAGIC NUMBERS
    const hash = await this.bundlerClient.sendUserOperation({
      calls: [transaction],
      maxPriorityFeePerGas: 1000304n,
      maxFeePerGas: 1000304n,
      paymasterVerificationGasLimit: 1000304n,
    });


    const receipt = await this.bundlerClient.waitForUserOperationReceipt({ hash });
    
    console.log("Transaction receipt:", receipt);
  }
}
