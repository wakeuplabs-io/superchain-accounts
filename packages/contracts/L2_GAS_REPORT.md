# L2 Deployment Cost Estimates

This report provides estimates for deploying the Superchain contracts on various L2 networks (Optimism, Base, and Unichain). The costs are calculated based on gas usage from local testing and approximate L2 fee models.

## Gas Usage

| Contract | Gas Used |
| --- | --- |
| SuperchainBadges | 1,395,993 |
| SuperchainPoints | 911,681 |
| SuperchainPointsRaffle | 899,227 |
| SuperchainPointsRaffleFactory | 1,193,805 |
| **Total** | **4,400,706** |

## L2 Deployment Cost Estimates

| Network | L2 Execution Fee (ETH) | L1 Data Fee (ETH) | Total Fee (ETH) | Total Fee (USD) |
| --- | --- | --- | --- | --- |
| Optimism | 0.000004 | 0.015050 | 0.015055 | $25.59 |
| Base | 0.000002 | 0.015050 | 0.015053 | $25.59 |
| Unichain | 0.000004 | 0.011002 | 0.011006 | $18.71 |

## Method Costs on Optimism

| Method | Gas Used | Cost on Optimism (ETH) | Cost on Optimism (USD) |
| --- | --- | --- | --- |
| SuperchainBadges.addClaimable | 94,670 | 0.000324 | $0.55 |
| SuperchainBadges.claim | 74,966 | 0.000256 | $0.44 |
| SuperchainBadges.mint | 52,302 | 0.000179 | $0.30 |
| SuperchainBadges.setURI | 49,407 | 0.000169 | $0.29 |
| SuperchainPoints.addClaimable | 49,312 | 0.000169 | $0.29 |
| SuperchainPoints.approve | 46,690 | 0.000160 | $0.27 |
| SuperchainPoints.claim | 93,552 | 0.000320 | $0.54 |
| SuperchainPoints.mint | 70,714 | 0.000242 | $0.41 |
| SuperchainPointsRaffle.claimTickets | 954,868 | 0.003267 | $5.55 |
| SuperchainPointsRaffle.initialize | 253,219 | 0.000866 | $1.47 |
| SuperchainPointsRaffle.revealWinner | 91,437 | 0.000313 | $0.53 |
| SuperchainPointsRaffleFactory.createRaffle | 863,842 | 0.002955 | $5.02 |

## Cost Breakdown by Contract on L2 Networks

### Optimism

| Contract | Gas Used | L2 Execution Fee (ETH) | L1 Data Fee (ETH) | Total Fee (ETH) | Total Fee (USD) |
| --- | --- | --- | --- | --- | --- |
| SuperchainBadges | 1,395,993 | 0.000001 | 0.004774 | 0.004776 | $8.12 |
| SuperchainPoints | 911,681 | 0.000001 | 0.003118 | 0.003119 | $5.30 |
| SuperchainPointsRaffle | 899,227 | 0.000001 | 0.003075 | 0.003076 | $5.23 |
| SuperchainPointsRaffleFactory | 1,193,805 | 0.000001 | 0.004083 | 0.004084 | $6.94 |
| **Total** | **4,400,706** | **0.000004** | **0.015050** | **0.015055** | **$25.59** |

### Base

| Contract | Gas Used | L2 Execution Fee (ETH) | L1 Data Fee (ETH) | Total Fee (ETH) | Total Fee (USD) |
| --- | --- | --- | --- | --- | --- |
| SuperchainBadges | 1,395,993 | 0.000001 | 0.004774 | 0.004775 | $8.12 |
| SuperchainPoints | 911,681 | 0.000000 | 0.003118 | 0.003118 | $5.30 |
| SuperchainPointsRaffle | 899,227 | 0.000000 | 0.003075 | 0.003076 | $5.23 |
| SuperchainPointsRaffleFactory | 1,193,805 | 0.000001 | 0.004083 | 0.004083 | $6.94 |
| **Total** | **4,400,706** | **0.000002** | **0.015050** | **0.015053** | **$25.59** |

### Unichain

| Contract | Gas Used | L2 Execution Fee (ETH) | L1 Data Fee (ETH) | Total Fee (ETH) | Total Fee (USD) |
| --- | --- | --- | --- | --- | --- |
| SuperchainBadges | 1,395,993 | 0.000001 | 0.003490 | 0.003491 | $5.94 |
| SuperchainPoints | 911,681 | 0.000001 | 0.002279 | 0.002280 | $3.88 |
| SuperchainPointsRaffle | 899,227 | 0.000001 | 0.002248 | 0.002249 | $3.82 |
| SuperchainPointsRaffleFactory | 1,193,805 | 0.000001 | 0.002985 | 0.002986 | $5.08 |
| **Total** | **4,400,706** | **0.000004** | **0.011002** | **0.011006** | **$18.71** |

## Notes on L2 Gas Calculations

1. **L2 Execution Fee**: This is the cost of executing the transaction on the L2 network. It's typically much lower than on Ethereum mainnet.

2. **L1 Data Fee**: This is the cost of posting transaction data to Ethereum L1 for security. This is usually the dominant cost for L2 transactions, especially for contract deployments.

3. **Fee Model Approximations**:
   - Optimism: Uses a fee model where L1 data costs are passed to users
   - Base: Similar to Optimism's fee model
   - Unichain: Estimated based on similar L2 networks

4. **Gas Price Assumptions**:
   - Optimism: 0.001 gwei
   - Base: 0.0005 gwei
   - Unichain: 0.001 gwei

5. **ETH Price**: Calculations use an ETH price of $1,700 USD

## How to Update These Estimates

To update these estimates with different parameters, modify the constants in the `scripts/calculate-l2-costs.js` file and run:

```bash
node scripts/calculate-l2-costs.js
```
