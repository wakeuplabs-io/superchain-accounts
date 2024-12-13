# WakeUp Bundler

This project handles the deployment of the the [WakeUp Bundler](https://github.com/wakeuplabs-io/pimlico-alto-smart-account-bundler). This bundler is in charge of collecting User Operations from the Superchain Accounts and sending them to the EntryPoint contract.

## Bundler

The WakeUp Bundler is a service that collects User Operations from the Superchain Accounts and sends them to the EntryPoint contract. Its a key component of the [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) standard.

This Bundler requires multiple executor wallets. If any wallet's balance falls below a set minimum, its balance is automatically refilled using funds from the utility wallet. *The utility wallet needs to be funded before starting the bundler.*

EntryPoint V0.7 relies on a simulation contract to be deployed. The bundler uses this contract during validation and gas estimations. The simulation contract can be deployed by enabling the `--deploy-simulations-contract` flag.


### Configuration

The following configuration options are available:

- `entrypoints`: EntryPoint contract addresses split by commas [required]
- `entrypoint-simulation-contract`: Address of the EntryPoint simulations contract
- `executor-private-keys`: Private keys of the executor accounts split by commas [required]
- `utility-private-keys`: Private key of the utility account
- `safe-mode`: Enable safe mode (enforcing all ERC-4337 rules)
- `port`: The port to listen for requests
- `deploy-simulations-contract`: Deploy the EntryPoint simulations contract (optional if `entrypoint-simulation-contract` is provided)
- `chain-type`: The chain type of the network the bundler will interact with (in this case `op-stack`)


This configs can either be pass as command line arguments or set in a json config file. Here is an example of a json config file:
```json
{
  "entrypoints": "0x0000000071727De22E5E9d8BAf0edAc6f37da032,0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
  "entrypoint-simulation-contract": "0x74cb5e4ee81b86e70f9045036a1c5477de69ee87",
  "executor-private-keys": "0x34e9a7...,0xb08d34...,0x163cbb...",
  "utility-private-keys": "0xe768f1...",
  "rpc-url": "http://localhost:8545",
  "safe-mode": false,
  "port": 4337,
  "chain-type": "op-stack"
}
```

## Deployment

The deployment will be done using [SST Library](https://sst.dev/). This library allows write all the deployment instruction using Typescript, abstracting the complexity of the deployment process.

We are using the [SST Cluster component](https://sst.dev/docs/component/aws/cluster). This component allows us to deploy a cluster of FARGATE ECS instances with a load balancer in front of them. The load balancer will be used to distribute the requests to the instances.

The bundler will be containerize using the [Dockerfile](./Dockerfile) in the root of the project.

### Requirements

- [Docker](https://www.docker.com/)
- AWS Credentials configured in your machine, check the [AWS account set up](https://sst.dev/docs/aws-accounts) documentation of SST. The account must have permission to create, update and remove the following AWS resources:
  - ECS Cluster
  - ECS Service
  - ECS Task Definition
  - Application Load Balancer
  - VPC
- The following network contracts and wallets:
  - Entrypoint
  - 2 Executor wallets private keys
  - Utility wallet private key

### Steps

1. Install the project dependencies by running `pnpm install` in the root of the repository.
2. Configure the following environment variables in the `.env` file:
    - `AWS_REGION`: The AWS region to deploy the stack. (default: `us-east-2`)
    - `AWS_PROFILE`: The AWS profile to use for the deployment. (default: `default`)
    - `BUNDLER_VERSION`: The version of the bundler to deploy. Must be a tag or branch of the [WakeUp Bundler](https://github.com/wakeuplabs-io/pimlico-alto-smart-account-bundler) repository. (default: `v1.2.2`)
    - `ENTRYPOINTS`: The entrypoints addresses to use for the bundler, separated by commas.
    - `EXECUTOR_PRIVATE_KEYS`: The executor private keys to use for the bundler, separated by commas.
    - `UTILITY_PRIVATE_KEY`: The utility private key to use for the bundler.
    - `RPC_URL`: The RPC URL of the network to use for the bundler.
    - `PORT`: The port the bandler will be listening too (By default the Load Balancer will be listening to port 80 and redirect the request to the provided port) (default: `4337`)

3. Run `pnpm deploy:staging` to deploy the stack.

## Glossary

### Executor

Executors work closely with bundlers, taking the aggregated UserOperations and performing the actual on-chain execution, ensuring that each operation meets its predefined requirements and is processed correctly within the blockchain's execution environment.