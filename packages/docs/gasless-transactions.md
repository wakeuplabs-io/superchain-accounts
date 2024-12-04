# Gasless Transactions

Here are several ways to offer gasless transactions to your users.

### Send transactions with backend wallets

If a contract method can be called on behalf of a user, the simplest approach is to send the transaction from a backend wallet.

Examples:

- An NFT contract that can be claimed *by* a wallet and *sent to* another wallet.
- An oracle where state can be updated by any wallet.

### Send meta-transactions with relayers

If your contract supports meta-transactions, use Engine as a relayer to send meta-transactions that are signed by your users' wallets.

### Send transactions with smart accounts

If your users have smart accounts, use Engine backend wallets to transact on behalf of smart accounts.

[Learn more about smart accounts in Engine.](https://portal.thirdweb.com/engine/features/smart-wallets)

### Overview of the Process

In an ERC-4337 system, instead of sending a transaction directly to the blockchain (like in typical Ethereum transactions), the user sends a `UserOperation` (a type of transaction request) to a _bundler_. The bundler is a specialized node that takes these `UserOperations` from multiple users, batches them together, and submits them to the Ethereum blockchain in one transaction. Here’s how each step works:

### Step-by-Step Breakdown

1. **User Creates a `UserOperation` Object**:

   - The user generates a `UserOperation`, which is a data structure containing all details about the intended action, such as:
     - The recipient address.
     - The amount of tokens or ETH to transfer.
     - Call data (for functions they might want to call in a contract).
     - Gas limits and fees.
   - The user then _signs_ this `UserOperation` to authorize it.

2. **User Sends the `UserOperation` to the Bundler**:
   - The user doesn’t send the `UserOperation` directly to the Ethereum network because it’s not a traditional Ethereum transaction. Instead, they send it to a bundler through a REST API or similar interface provided by the bundler service.
   - The bundler has an API endpoint (e.g., `/rpc/v1/bundle`) where users can submit their signed `UserOperations`.
3. **Bundler Receives and Validates the `UserOperation`**:
   - Upon receiving the `UserOperation`, the bundler performs a series of checks:
     - **Signature verification**: Ensures the `UserOperation` was indeed signed by the user.
     - **Gas and fee checks**: Verifies that the gas and fee details are reasonable.
     - **Preconditions**: Checks that the user’s account has enough funds or is backed by a paymaster to cover fees.
4. **Bundler Batches Multiple `UserOperations` and Creates a Blockchain Transaction**:
   - To optimize costs, the bundler aggregates multiple `UserOperations` into one Ethereum transaction. This reduces the amount of gas per individual `UserOperation` and helps keep fees low for each user.
5. **Bundler Submits the Batched Transaction to the Ethereum Network**:
   - The bundler sends this batched transaction to Ethereum via the **EntryPoint contract**, which is a smart contract specifically designed to handle ERC-4337 operations.
   - The bundler pays the gas fees in ETH for this transaction when submitting it.
6. **EntryPoint Contract Processes Each `UserOperation` in the Batch**:
   - The EntryPoint contract processes each `UserOperation` in the batch individually:
     - It verifies that each operation is valid (e.g., proper signature, sufficient funds).
     - It executes the operations as if they were regular transactions, interacting with smart contracts, transferring funds, or calling functions as specified in the `UserOperation`.
   - After execution, the bundler is compensated through a fee that can be in ETH or other tokens, as specified in the `UserOperation`.
7. **Bundler Receives Compensation for the Gas Fees**:
   - If a `UserOperation` specifies that fees will be paid in tokens other than ETH, the EntryPoint contract ensures the bundler is reimbursed accordingly (often through a **paymaster** contract).
   - The paymaster contract can cover fees in alternative tokens and handle the token reimbursement to the bundler, making the transaction "gasless" for the user.

### Visualization of the Process

Here’s a simplified visual flow of the process:

1. **User** → Sends `UserOperation` to **Bundler**.
2. **Bundler** → Collects and validates multiple `UserOperations`.
3. **Bundler** → Batches `UserOperations` and submits to **EntryPoint Contract** on the blockchain.
4. **EntryPoint Contract** → Processes each `UserOperation`.
5. **Bundler** → Receives compensation (ETH or other tokens) for covering the transaction gas fees.

### Why Use This Flow?

This approach allows users to interact with the blockchain without needing ETH in their wallets, as the bundler handles gas payment. It simplifies user experience, especially for those who might only hold tokens (e.g., stablecoins) and not ETH.

Let me know if you have further questions about any of the steps!

### So the user only needs to sign the user operation with his wallet right?

Yes, exactly! In ERC-4337, the user only needs to sign the `UserOperation` with their wallet to authorize it. The rest of the process—bundling, submitting to the blockchain, and covering gas fees—is handled by the bundler. Here’s a summary of the steps from the user’s perspective:

1. **Prepare the `UserOperation`**:

   - The user’s wallet app creates the `UserOperation` object. This includes details like the recipient, amount, and any function calls or data needed for the transaction.

2. **Sign the `UserOperation`**:

   - The user signs the `UserOperation` with their wallet. This signature proves that the user approves and authorizes the transaction, preventing any unauthorized changes to the operation.

3. **Send the Signed `UserOperation` to a Bundler**:

   - The signed `UserOperation` is sent to a bundler via an API endpoint, either directly by the user’s wallet app or by a dApp that has integrated bundler support.

Once the signed `UserOperation` is with the bundler, the user doesn’t have to do anything else. The bundler takes over from there, managing gas fees and submitting the operation to the blockchain.

This setup is a key part of ERC-4337’s account abstraction, making blockchain interactions simpler and allowing users to transact without directly holding ETH.
