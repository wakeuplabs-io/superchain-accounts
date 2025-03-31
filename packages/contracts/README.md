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

## Environment Variables

The following environment variables are used by the project:

- **NETWORK_TESTNET**: Specifies the testnet network to be used.
- **NETWORK_MAINNET**: Specifies the mainnet network to be used.
- **TESTNET_PRIVATE_KEY**: Private key for the testnet account.
- **MAINNET_PRIVATE_KEY**: Private key for the mainnet account.
- **ETHERSCAN_API_KEY**: API key for Etherscan.
- **LOCAL_CHAIN_ID**: Chain ID for the local development environment.
- **LOCAL_CHAIN_NAME**: Name of the local development chain.
- **LOCAL_RPC_URL**: RPC URL for the local development environment.
- **LOCAL_PRIVATE_KEY**: Private key for the local development account.

## Compiling the Contracts

To compile the contracts, run the following command:
```bash
pnpm build
```
It will create the proper artifacts in the `artifacts` folder and generate typed abis definitions using [Wagmi](https://wagmi.sh/)

## Testing the Contracts

To test the contracts, run the following command:

```bash
pnpm test
```

## Deploying the Contracts

### Mainnet

1. Set the following environment variables:
    - `NETWORK_MAINNET`
    - `MAINNET_PRIVATE_KEY`
    - `ETHERSCAN_API_KEY`

make sure to use a private key with enough balance to deploy the contracts.

2. Run the following command:
```bash
pnpm deploy:mainnet
```

### Testnet

1. Set the following environment variables:
    - `NETWORK_TESTNET`
    - `TESTNET_PRIVATE_KEY`
    - `ETHERSCAN_API_KEY`

make sure to use a private key with enough balance to deploy the contracts.

2. Run the following command:
```bash
pnpm deploy:testnet
```

## Set up the paymaster

Once the deployment is finished, you will need to deposit funds to the `WakeUp Paymaster` in order for it to be able to sponsor the user operations. 

To do this, grab the paymaster contract address from the deployment output and run the following command:

``` bash
pnpm setup-paymaster:<testnet | mainnet> -- --paymaster <PAYMASTER_CONTRACT_ADDRESS>
```
make sure to use a private key with enough balance to deposit funds.