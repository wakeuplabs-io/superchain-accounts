import { PackedUserOperation } from "viem/_types/account-abstraction/types/userOperation";
import { entrypointMockAbi, wakeupPaymasterAbi } from "../shared/abis";
import { PublicClient, WalletClient, Address, toHex } from "viem";


/**
 * A service class for interacting with the WakeUpPaymaster contract.
 */
export class WakeUpPaymasterService {
  private publicClient: PublicClient;
  private ownerClient: WalletClient;
  private entryPoint: Address;
  private address: Address;
  private abi = wakeupPaymasterAbi;
  private entryPointAbi = entrypointMockAbi;

  /**
   * Creates a new instance of WakeUpPaymaster Service.
   * @param _publicClient - The client for reading contract data.
   * @param _ownerClient - The client for signing transactions.
   * @param address - Optional. The address of the WakeUpPaymaster contract. Defaults to `ZERO_ADDRESS`.
   */
  constructor(
    _publicClient: PublicClient,
    _ownerClient: WalletClient,
    _entryPoint: Address,
    address: Address
  ) {
    this.publicClient = _publicClient;
    this.ownerClient = _ownerClient;
    this.entryPoint = _entryPoint;
    this.address = address;
  }

  async getOwner(): Promise<Address> {
    return this.publicClient.readContract({
      address: this.address,
      abi: this.abi,
      functionName: "owner",
    });
  }

  async allowAccount(accountAddress: Address, executor?: WalletClient): Promise<void> {
    const walletClient = executor ? executor : this.ownerClient;

    const { request } = await this.publicClient.simulateContract({
      address: this.address,
      abi: this.abi,
      functionName: "allowAccount",
      args: [accountAddress],
      account: walletClient.account,
    });

    const hash = await walletClient.writeContract(request);

    await this.publicClient.waitForTransactionReceipt({ hash });
  }

  async isAccountAllowed(accountAddress: Address, executor?: WalletClient): Promise<boolean> {
    const walletClient = executor ? executor : this.ownerClient;

    return this.publicClient.readContract({
      address: this.address,
      abi: this.abi,
      functionName: "isAccountAllowed",
      args: [accountAddress],
      account: walletClient.account,
    });
  }

  async removeAccount(accountAddress: Address, executor?: WalletClient): Promise<void> {
    const walletClient = executor ? executor : this.ownerClient;

    const { request } = await this.publicClient.simulateContract({
      address: this.address,
      abi: this.abi,
      functionName: "removeAccount",
      args: [accountAddress],
      account: walletClient.account,
    });

    const hash = await walletClient.writeContract(request);

    await this.publicClient.waitForTransactionReceipt({ hash });
  }

  // This call should be made from the entrypoint
  async validatePaymasterUserOp(userOp: PackedUserOperation) {
    const { request } = await this.publicClient.simulateContract({
      address: this.entryPoint,
      abi: this.entryPointAbi,
      functionName: "testValidatePaymasterOp",
      args: [this.address, userOp, toHex("OP_HASH", {size:32}), 0n],
      account: this.ownerClient.account,
    });

    const result = await this.ownerClient.writeContract(request);

    return this.publicClient.waitForTransactionReceipt({ hash: result });
  }

  buildUserOperation(params: Partial<PackedUserOperation>): PackedUserOperation {
    return {
      sender: "0x0000000000000000000000000000000000000000",
      nonce: BigInt(0),
      initCode: toHex("INIT_CODE"),
      callData: toHex("CALL_DATA"),
      accountGasLimits: toHex(1, {size:32}),
      preVerificationGas: BigInt(1),
      gasFees: toHex(1, {size:32}),
      signature: toHex("signature"),
      paymasterAndData: toHex("paymaster_and_data"),
      ...params,
    };
  }
}
