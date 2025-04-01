import { Address, Chain, Client, http, PublicClient, Transport } from "viem";
import { createSmartAccountClient, SmartAccountClient } from "permissionless";
import { toSimpleSmartAccount, ToSimpleSmartAccountParameters } from "permissionless/accounts";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import {
  EntryPointVersion,
  SmartAccount,
  UserOperationCall,
} from "viem/account-abstraction";
import { supportedChains } from "../networks";

export class SmartAccountHandler {
  private smartAccount: SmartAccount | null = null;
  private smartAccountClient: SmartAccountClient<Transport, Chain, SmartAccount, Client, undefined> | null = null;

  constructor(
    private readonly publicClient: PublicClient,
    private readonly pimlicoUrl: string,
    private readonly entryPointAddress: Address,
  ) {}

  getSmartAccount(): SmartAccount | null {
    return this.smartAccount;
  }

  async initialize(owner: ToSimpleSmartAccountParameters<EntryPointVersion>["owner"]): Promise<SmartAccount> {
    this.smartAccount = await toSimpleSmartAccount({
      owner,
      client: this.publicClient,
      entryPoint: {
        address: this.entryPointAddress,
        version: "0.7",
      }
    });

    if(!this.smartAccount) { 
      throw Error("Smart account not initialized");
    }

    const pimlicoClient = createPimlicoClient({
      transport: http(this.pimlicoUrl),
      entryPoint: {
        address: this.entryPointAddress,
        version: "0.7",
      },
    });

    this.smartAccountClient = createSmartAccountClient({
      account: this.smartAccount,
      chain: supportedChains.optimismSepolia,
      bundlerTransport: http(this.pimlicoUrl),
      paymaster: pimlicoClient, // optional
      userOperation: {
        estimateFeesPerGas: async () => {
          return (await pimlicoClient.getUserOperationGasPrice()).fast; // only when using pimlico bundler
        },
      }
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

    // Send a user operation to the bundler to deploy the smart account
    const transaction = {
      to: this.smartAccount.address,
      value: BigInt(0),
    };
    
    await this.sendTransaction(transaction);
  }

  async sendTransaction(transaction: UserOperationCall) {
    if(!this.smartAccountClient ) {
      throw Error("Smart account client not initialized");
    }

    const receipt = await this.smartAccountClient.sendTransaction(transaction);
    
    console.log("Transaction receipt:", receipt);
  }
}
