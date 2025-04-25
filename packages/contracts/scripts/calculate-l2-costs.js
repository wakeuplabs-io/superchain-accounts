// L2 gas price estimates (in gwei)
const L2_GAS_PRICES = {
  optimism: 0.001, // Much lower than Ethereum mainnet
  base: 0.0005,    // Even lower than Optimism
  unichain: 0.001  // Similar to Optimism for estimation
};

// L2 fee multipliers (approximations)
const L2_FEE_MULTIPLIERS = {
  optimism: {
    l1Gas: 0.684,  // L1 data fee component
    l2Gas: 1.0     // L2 execution fee component
  },
  base: {
    l1Gas: 0.684,  // Similar to Optimism
    l2Gas: 1.0
  },
  unichain: {
    l1Gas: 0.5,    // Approximation
    l2Gas: 1.0
  }
};

// ETH price in USD
const ETH_PRICE_USD = 1700;

// Gas usage from our previous tests
const CONTRACT_GAS = {
  SuperchainBadges: 1395993,
  SuperchainPoints: 911681,
  SuperchainPointsRaffle: 899227,
  SuperchainPointsRaffleFactory: 1193805
};

// Calculate L2 costs
function calculateL2Cost(gasUsed, network) {
  const l2GasPrice = L2_GAS_PRICES[network];
  const l2FeeMultiplier = L2_FEE_MULTIPLIERS[network];
  
  // L2 execution fee
  const l2ExecutionFee = gasUsed * l2GasPrice * l2FeeMultiplier.l2Gas;
  
  // L1 data fee (approximation - this varies by L2 implementation)
  // For a more accurate calculation, we would need to know the calldata size
  // This is a rough approximation based on gas used
  const l1DataFee = (gasUsed / 10) * 50 * l2FeeMultiplier.l1Gas / 1e9;
  
  // Total fee in ETH
  const totalFeeETH = l2ExecutionFee / 1e9 + l1DataFee;
  
  // Total fee in USD
  const totalFeeUSD = totalFeeETH * ETH_PRICE_USD;
  
  return {
    gas: gasUsed,
    l2Fee: l2ExecutionFee / 1e9,
    l1Fee: l1DataFee,
    totalETH: totalFeeETH,
    totalUSD: totalFeeUSD
  };
}

// Main function
function main() {
  // Networks to estimate for
  const networks = ["optimism", "base", "unichain"];
  
  // Results storage
  const results = {};
  
  for (const network of networks) {
    console.log(`\n=== Estimating deployment costs on ${network.toUpperCase()} ===`);
    results[network] = {};
    
    // Calculate costs for each contract
    for (const [contract, gas] of Object.entries(CONTRACT_GAS)) {
      results[network][contract] = calculateL2Cost(gas, network);
      
      console.log(`\n${contract}:`);
      console.log(`Gas used: ${gas}`);
      console.log(`L2 execution fee: ${results[network][contract].l2Fee.toFixed(6)} ETH ($${(results[network][contract].l2Fee * ETH_PRICE_USD).toFixed(2)} USD)`);
      console.log(`L1 data fee (approximation): ${results[network][contract].l1Fee.toFixed(6)} ETH ($${(results[network][contract].l1Fee * ETH_PRICE_USD).toFixed(2)} USD)`);
      console.log(`Total fee: ${results[network][contract].totalETH.toFixed(6)} ETH ($${results[network][contract].totalUSD.toFixed(2)} USD)`);
    }
    
    // Calculate total deployment cost for this network
    const totalGas = Object.values(results[network]).reduce((sum, result) => sum + result.gas, 0);
    const totalL2Fee = Object.values(results[network]).reduce((sum, result) => sum + result.l2Fee, 0);
    const totalL1Fee = Object.values(results[network]).reduce((sum, result) => sum + result.l1Fee, 0);
    const totalETH = totalL2Fee + totalL1Fee;
    const totalUSD = totalETH * ETH_PRICE_USD;
    
    console.log(`\nTotal deployment cost on ${network.toUpperCase()}:`);
    console.log(`Total gas: ${totalGas}`);
    console.log(`Total L2 execution fee: ${totalL2Fee.toFixed(6)} ETH ($${(totalL2Fee * ETH_PRICE_USD).toFixed(2)} USD)`);
    console.log(`Total L1 data fee: ${totalL1Fee.toFixed(6)} ETH ($${(totalL1Fee * ETH_PRICE_USD).toFixed(2)} USD)`);
    console.log(`Total fee: ${totalETH.toFixed(6)} ETH ($${totalUSD.toFixed(2)} USD)`);
  }
  
  // Generate markdown summary
  console.log("\n=== MARKDOWN SUMMARY ===\n");
  console.log("# L2 Deployment Cost Estimates\n");
  
  console.log("## Gas Usage\n");
  console.log("| Contract | Gas Used |");
  console.log("| --- | --- |");
  for (const [contract, gas] of Object.entries(CONTRACT_GAS)) {
    console.log(`| ${contract} | ${gas.toLocaleString()} |`);
  }
  console.log(`| **Total** | **${Object.values(CONTRACT_GAS).reduce((a, b) => a + b, 0).toLocaleString()}** |`);
  
  console.log("\n## Cost Estimates\n");
  console.log("| Network | L2 Execution Fee (ETH) | L1 Data Fee (ETH) | Total Fee (ETH) | Total Fee (USD) |");
  console.log("| --- | --- | --- | --- | --- |");
  
  for (const network of networks) {
    const totalL2Fee = Object.values(results[network]).reduce((sum, result) => sum + result.l2Fee, 0);
    const totalL1Fee = Object.values(results[network]).reduce((sum, result) => sum + result.l1Fee, 0);
    const totalETH = totalL2Fee + totalL1Fee;
    const totalUSD = totalETH * ETH_PRICE_USD;
    
    console.log(`| ${network.charAt(0).toUpperCase() + network.slice(1)} | ${totalL2Fee.toFixed(6)} | ${totalL1Fee.toFixed(6)} | ${totalETH.toFixed(6)} | $${totalUSD.toFixed(2)} |`);
  }
  
  // Method costs
  console.log("\n## Method Costs on Optimism\n");
  
  const methodGas = {
    "SuperchainBadges.addClaimable": 94670,
    "SuperchainBadges.claim": 74966,
    "SuperchainBadges.mint": 52302,
    "SuperchainBadges.setURI": 49407,
    "SuperchainPoints.addClaimable": 49312,
    "SuperchainPoints.approve": 46690,
    "SuperchainPoints.claim": 93552,
    "SuperchainPoints.mint": 70714,
    "SuperchainPointsRaffle.claimTickets": 954868,
    "SuperchainPointsRaffle.initialize": 253219,
    "SuperchainPointsRaffle.revealWinner": 91437,
    "SuperchainPointsRaffleFactory.createRaffle": 863842
  };
  
  console.log("| Method | Gas Used | Cost on Optimism (ETH) | Cost on Optimism (USD) |");
  console.log("| --- | --- | --- | --- |");
  
  for (const [method, gas] of Object.entries(methodGas)) {
    const cost = calculateL2Cost(gas, "optimism");
    console.log(`| ${method} | ${gas.toLocaleString()} | ${cost.totalETH.toFixed(6)} | $${cost.totalUSD.toFixed(2)} |`);
  }
}

main();
