# Gas Cost Report for Superchain Contracts

This report provides an overview of the gas costs for deploying and interacting with the Superchain contracts.

## Deployment Gas Costs

| Contract                      | Gas Used      | % of Block Limit (30M) |
| ----------------------------- | ------------- | ---------------------- |
| SuperchainBadges              | 1,395,993     | 4.7%                   |
| SuperchainPoints              | 911,681       | 3.0%                   |
| SuperchainPointsRaffle        | 899,227       | 3.0%                   |
| SuperchainPointsRaffleFactory | 1,193,805     | 4.0%                   |
| **Total**                     | **4,400,706** | **14.7%**              |

## Method Gas Costs

### SuperchainBadges

| Method       | Min Gas | Max Gas | Avg Gas |
| ------------ | ------- | ------- | ------- |
| addClaimable | -       | -       | 94,670  |
| claim        | -       | -       | 74,966  |
| mint         | 50,339  | 52,839  | 52,302  |
| setURI       | -       | -       | 49,407  |

### SuperchainPoints

| Method       | Min Gas | Max Gas | Avg Gas |
| ------------ | ------- | ------- | ------- |
| addClaimable | -       | -       | 49,312  |
| approve      | -       | -       | 46,690  |
| claim        | -       | -       | 93,552  |
| mint         | 70,702  | 70,726  | 70,714  |

### SuperchainPointsRaffle

| Method            | Min Gas | Max Gas   | Avg Gas |
| ----------------- | ------- | --------- | ------- |
| claimTickets      | 319,691 | 2,320,571 | 954,868 |
| initialize        | 96,991  | 269,664   | 253,219 |
| revealWinner      | -       | -         | 91,437  |
| transferOwnership | -       | -         | 28,684  |

### SuperchainPointsRaffleFactory

| Method       | Min Gas | Max Gas | Avg Gas |
| ------------ | ------- | ------- | ------- |
| createRaffle | 858,122 | 867,656 | 863,842 |

## Cost Estimation

Using a gas price of 20 gwei and an ETH price of approximately $1,700:

- Total deployment cost: 4,400,706 gas \* 20 gwei = 0.088 ETH ≈ $150 USD
- Average cost to create a raffle: 863,842 gas \* 20 gwei = 0.017 ETH ≈ $29 USD
- Average cost to claim tickets: 954,868 gas \* 20 gwei = 0.019 ETH ≈ $32 USD

## Notes

- Gas costs may vary depending on the network conditions and the specific parameters used.
- The gas costs reported here are based on local testing and may differ in production environments.
- For L2 networks like Optimism and Base, gas costs are typically lower than on Ethereum mainnet.

## How to Run Gas Reporter

To generate an updated gas report, run:

```bash
npx hardhat test
```

This will create a `gas-report.txt` file with detailed gas usage information.

For a more realistic deployment scenario, run:

```bash
npx hardhat run scripts/estimate-deployment-gas.js
```
