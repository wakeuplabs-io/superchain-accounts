# Pimlico Alto Bundler

This file documents the configuration and steps to follow to self-host the [Pimlico Alto Bundler](https://github.com/pimlicolabs/alto)

## Setup And Prerequisites

https://docs.pimlico.io/infra/bundler/self-host#setup-and-prerequisites

Alto manages multiple executor wallets. If any wallet's balance falls below a set minimum, its balance is automatically refilled using funds from the utility wallet. The utility wallet needs to be funded before starting Alto.

EntryPoint V0.7 relies on a simulation contract to be deployed. Alto uses this contract during validation and gas estimations. The simulation contract can be deployed by enabling the `--deploy-simulations-contract` flag.

- Utility wallet is funded
- Simulations contract is deployed

## Configuration

Create a `alto-config.json` file and include the following configurations in order to run the bundler:

```json
{
  "entrypoints": "0x0000000071727De22E5E9d8BAf0edAc6f37da032,0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
  "entrypoint-simulation-contract": "0x74cb5e4ee81b86e70f9045036a1c5477de69ee87",
  "executor-private-keys": "0x34e9a7...,0xb08d34...,0x163cbb...",
  "utility-private-keys": "0xe768f1...",
  "rpc-url": "http://localhost:8545",
  "safe-mode": false
}
```

- `entrypoints`: EntryPoint contract addresses split by commas [required]
- `entrypoint-simulation-contract`: Address of the EntryPoint simulations contract
- `executor-private-keys`: Private keys of the executor accounts split by commas [required]
- `utility-private-keys`: Private key of the utility account
- `safe-mode`: Enable safe mode (enforcing all ERC-4337 rules)

### Entrypoint Addresses

#### v7

- Address: `0x0000000071727De22E5E9d8BAf0edAc6f37da032`
  - Available in:
    - [OP Sepolia](https://sepolia-optimism.etherscan.io/address/0x0000000071727De22E5E9d8BAf0edAc6f37da032OP)
    - [Base Sepolia](https://sepolia.basescan.org/address/0x0000000071727De22E5E9d8BAf0edAc6f37da032)
    - [Cyber Sepolia](https://cyberscan.co/address/0x0000000071727de22e5e9d8baf0edac6f37da032)
- Address:`0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789`
  - Available in:
    - [OP Sepolia](https://sepolia-optimism.etherscan.io/address/0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789)
    - [Base Sepolia](https://sepolia.basescan.org/address/0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789)
    - [Cyber Sepolia](https://cyberscan.co/address/0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789)

#### Simulation Contract (Pimlico)

- Address: `0xBbe8A301FbDb2a4CD58c4A37c262ecef8f889c47`
  - Available in:
    - [OP Sepolia](https://sepolia-optimism.etherscan.io/address/0xBbe8A301FbDb2a4CD58c4A37c262ecef8f889c47)

### Bundler execution example

- Create 3 wallets in OP Sepolia:
  - 2 Executors wallets
  - 1 Utility wallet
  - **Note:** All wallets need to have gas funds
- Clone the repo https://github.com/pimlicolabs/alto
  - Run `pnpm install` and `pnpm build` to prepare the bundler
- Create a `alto-config.json` file in pimlico bundler directory, here is an example:
  - entrypoints: use the ones mentioned in [Entrypoint Addresses v7](#v7)
  - entrypoint-simulation-contract: use the one mentioned in [Simulation Contract](#simulation-contract-pimlico)
  - executor-private-keys: use previously created executor wallets (if private keys are exported from Metamask add `0x` at the beginning)
  - utility-private-keys: use previously created utility wallet (if private key is exported from Metamask add `0x` at the beginning)
  - rpc-url: https://sepolia.optimism.io
  - chain-type: "op-stack" to indicate the bundler we will be using OP Sepolia stack
  - safe-mode: true to enforce ERC-4337 rules
  - port: the port that the bundler will use to listen for operations

```json
{
  "entrypoints": "0x0000000071727De22E5E9d8BAf0edAc6f37da032,0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
  "entrypoint-simulation-contract": "0x74cb5e4ee81b86e70f9045036a1c5477de69ee87",
  "executor-private-keys": "0x34e9a7...,0xb08d34...,0x163cbb...",
  "utility-private-keys": "0x6eb2024606e42af07cd79B0588Fdc010f1a40ab6",
  "rpc-url": "https://sepolia.optimism.io",
  "chain-type": "op-stack",
  "safe-mode": true,
  "port": 3030
}
```

- Run `./alto run --config "alto-config.json"` to start the bundler

## Pimlico local testing environment

https://docs.pimlico.io/permissionless/how-to/local-testing

## Glossary

### Bundler

In the Ethereum Account Abstraction (ERC-4337) standard, the bundler plays a critical role in the transaction lifecycle:

Key Responsibilities:

- Collects UserOperations from users' wallets
- Bundles multiple UserOperations into a single transaction
- Pays network gas fees on behalf of users
- Submits bundled transactions to the EntryPoint contract
- Ensures economic viability by verifying each UserOperation's validity and potential profitability

Technical Process:

1. Receives individual UserOperations from different accounts
2. Validates each operation's signature and paymaster details
3. Aggregates operations into a single batch transaction
4. Pays Ethereum gas fees, then gets reimbursed through the operations' built-in fee mechanism
5. Sends the bundled transaction to the EntryPoint smart contract for processing

The bundler essentially acts as a transaction aggregator and economic coordinator, enabling gas abstraction and improving user experience in blockchain interactions by handling complex transaction logistics behind the scenes.

### Executor

In the Ethereum Account Abstraction (ERC-4337) context, executors are specialized nodes responsible for:

1. Processing bundled UserOperations
2. Calling the EntryPoint contract's `handleOps()` method
3. Executing the actual blockchain transactions
4. Verifying and validating each operation's execution conditions
5. Handling complex transaction logic defined in user wallets

Executors work closely with bundlers, taking the aggregated UserOperations and performing the actual on-chain execution, ensuring that each operation meets its predefined requirements and is processed correctly within the blockchain's execution environment.
