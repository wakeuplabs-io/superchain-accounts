# WakeUp ERC-4337 Contracts

Project that contains all the necessary contracts for implementing the ERC-4337 standard

## Contracts

All the contracts are located in the `contracts` folder. They extend from the [WakeUp Account Abstraction](https://github.com/wakeuplabs-io/wakeup-account-abstraction) ERC-4337 contract implementations.

### WakeUp Entrypoint

Core component of the ERC-4337 standard. It's in charge of:

- Creating Smart Accounts if not exists.
- Verify User Operations against its destination Smart Account.
- Execute operations.
- Manage Smart Account and Paymaster deposits used for gas payment.
- Manage Paymaster Staking
- Manage Smart Account Nonces.

### WakeUp Entrypoints Simulations

Contract used by bundler to simulate the `WakeUp Entrypoint` contract. It's used to calculate the gas cost of the operations before sending them to the `WakeUp Entrypoint` contract.

### WakeUp Simple Account Factory

Contract in charge of creating account abstractions. It's address is provided in the `initCode` property of the `User Operation`, which then the `WakeUp Entrypoint` contract uses to create account abstractions when needed. It uses the `CREATE2` opcode to calculate the account abstractions address in a deterministic way.

### WakeUp Paymaster

Contract in charge of sponsor for the gas of the operations on behalf of the account abstractions. It's address is provided in the `paymasterAndData` property of the `User Operation`, which then the `WakeUp Entrypoint` contract uses to pay for the gas of the operations.
In order to sponsor for the gas of the operations, the paymaster needs to have a deposit in the `WakeUp Entrypoint` contract. The deposit is done by calling the `depositFor` function of the `WakeUp Entrypoint` contract.
Accounts must be allowed by the Paymaster Owner so its transactions could be sponsored. This is done by calling the `allowAccount` function of the `WakeUp Paymaster` contract.
