## Superchain Accounts Implementation

// TODO: follow from this point

## ERC-4337 implementation

We have implemented a custom Smart Account based on the [ERC-4337 Standard](https://eips.ethereum.org/EIPS/eip-4337). This account setup allows the following actions:

- Execute transactions and operations just like any externally owned account (EOA), enabling seamless interaction with other smart contracts and accounts.
- Verify signatures, allowing secure validation of transaction authenticity.
- Add account guardians to enable account recovery, providing a secure mechanism for restoring access.

## ERC-4337 implementation based on eth-infinitism

After some research we found an implementation of [ERC-4337 Standard](https://eips.ethereum.org/EIPS/eip-4337) by eth-infinitism. Our goal is to create our own contracts that satisfy the standard based on the contracts and interfaces proposed by the [account-abstraction project](https://github.com/eth-infinitism/account-abstraction) . By doing this we avoid the necessity to implement the entire standard ourselves and prevent errors that already have been addressed by eth-infinitism.

### Implementing the SmartAccount contract

In the first iteration, we built a SmartAccount contract similar to the [SimpleAccount](https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/SimpleAccount.sol) example provided by eth-infinitism. It extends the [BaseAccount contract](https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/core/BaseAccount.sol), and as a simplification, we implemented only the `Initializable` interface. It provides the following methods:

- `initialize`: Sets the owner address of the account
- `receive`: Adds funds to the SmartAccount
- `addDeposit`: Adds funds to the SmartAccount (this also increments the balance in the EntryPoint)
- `execute`: Performs a function call. This Emimic the same behavior as an EOA for handling transactions.
- `validateSignature`: Validates the operation was sent by the owner of the account

In order to make it easy to test we created an `EntryPoint` mock that simulates all internal account calls.

#### Notes

- `execute` function was tested in two ways:
  - a transfer of funds from a Smart Account to a EOA. The function expects a parameter that indicates the function it needs to execute. In this case `0x` was sent as an empty `call` to an address in solidity means a transfer
  - a contract execution. We added a test function in `EntrypointMock` to update a state variable. In order to work we needed to encode the function parameter like this:
    ```typescript
    encodeFunctionData({
      abi: entryPointMockAbi,
      functionName: "updateStateNumber",
      args: [20],
    });
    ```
- This is the format of a `UserOperation`:

```solidity
   struct PackedUserOperation {
    address sender;
    uint256 nonce;
    bytes initCode;
    bytes callData;
    bytes32 accountGasLimits;
    uint256 preVerificationGas;
    bytes32 gasFees;
    bytes paymasterAndData;
    bytes signature;
  }
```

To test function that requires a `UserOperation` as parameter we need to encode the attributes like this:

```Typescript
{
sender: this._smartAccount,
nonce: userOp.nonce,
initCode: toHex(userOp.initCode),
callData: toHex(userOp.callData),
accountGasLimits: toHex(userOp.accountGasLimits, { size: 32 }),
preVerificationGas: userOp.preVerificationGas,
gasFees: toHex(userOp.gasFees, { size: 32 }),
paymasterAndData: toHex(userOp.paymasterAndData),
signature: userOp.signature,
}
```

Using Viem's `toHex` to transform a strings into its `bytes`/ `bytes32` representation. `nonce` attribute should be a `BigInt`

- `validateSignature`: To test this function we need to hash a message and then sign the hash using the owners wallet. These are the steps for hashing and signing:
  - define a `message` (could be any string)
  - create a `messageHash` by using `keccak256` like this: `keccak256(toBytes(message))`
  - Sign the message hash using the `signMessage` function from a wallet client like this:
    ```Typescript
    const signedMessage = investorOne.signMessage({
        message: { raw: messageHash },
      });
    ```
    - Note that the message should be passed as raw
  - call `validateSignature` sending `signedMessage` as `UserOperation.signature` and messageHash as `userOpHash`

### Implementing the SmartAccountFactory

The main purpose of this factory contract is to provide a way to create new `SmartAccount` contracts in a deterministic way, using the Create2 Ethereum feature. This allows the `SmartAccount` address to be calculated beforehand, which can be useful for various use cases, such as in the context of the "UserOperations".

**Constructor**:

- The constructor takes an `IEntryPoint` argument and initializes the `accountImplementation` variable with a new instance of the `SmartAccount` contract, passing the `IEntryPoint` as a parameter.

**createAccount Function**:

- This function is responsible for creating a new `SmartAccount` contract instance.
- It takes two arguments: `owner` (the address of the account owner) and `salt` (a value used for the Create2 deployment).
- The function first checks if the account already exists at the calculated address. If it does, it returns the existing account.
- If the account does not exist, it creates a new `ERC1967Proxy` contract that points to the `accountImplementation` and calls the `initialize` function, passing the `owner` as an argument.

**getAddress Function**:

- This function calculates the counterfactual address of the `SmartAccount` contract that would be created by the `createAccount` function.
- It takes the same arguments as `createAccount`: `owner` and `salt`.
- It uses the `Create2.computeAddress` function from OpenZeppelin to calculate the address based on the `salt` and the encoded deployment code and initialization parameters.

The `ERC1967Proxy` is used to create new instances of the `SmartAccount` contract. The factory contract maintains the implementation contract address and uses the `ERC1967Proxy` to create new instances that point to the same implementation, but with different initialization parameters (the `owner` address).

This approach allows for easy upgrades of the `SmartAccount` contract implementation, as the factory can be updated to use a new implementation without changing the addresses of the existing `SmartAccount` instances.

The `getAddress` function uses the `Create2.computeAddress` function to calculate the address of the `SmartAccount` contract that would be deployed by the `createAccount` function. This allows the factory to provide the calculated address to the caller, even before the actual deployment of the `SmartAccount` contract.

When using the `CREATE2` opcode and the `Create2.computeAddress` function, the same combination of `sender`, `salt`, and `initCodeHash` will always result in the same deployed contract address.

# Resources

- [ERC-4337 Standard](https://eips.ethereum.org/EIPS/eip-4337)
- [Gasless Transactions](./gasless-transactions.md)
- [account-abstraction project](https://github.com/eth-infinitism/account-abstraction)
