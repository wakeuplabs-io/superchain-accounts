const hre = require("hardhat");

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

async function estimateGasForContract(contractName, deployArgs, network) {
  console.log(`\nEstimating gas for ${contractName} on ${network}...`);
  
  // Get contract factory
  const ContractFactory = await hre.ethers.getContractFactory(contractName);
  
  // Estimate gas for deployment
  const deploymentGas = await hre.ethers.provider.estimateGas(
    ContractFactory.getDeployTransaction(...deployArgs).data
  );
  
  // Calculate costs
  const l2GasPrice = L2_GAS_PRICES[network];
  const l2FeeMultiplier = L2_FEE_MULTIPLIERS[network];
  
  // L2 execution fee
  const l2ExecutionFee = deploymentGas * l2GasPrice * l2FeeMultiplier.l2Gas;
  
  // L1 data fee (approximation - this varies by L2 implementation)
  // For a more accurate calculation, we would need to know the calldata size
  // This is a rough approximation based on gas used
  const l1DataFee = (deploymentGas / 10) * 50 * l2FeeMultiplier.l1Gas / 1e9;
  
  // Total fee in ETH
  const totalFeeETH = l2ExecutionFee / 1e9 + l1DataFee;
  
  // Total fee in USD
  const totalFeeUSD = totalFeeETH * ETH_PRICE_USD;
  
  console.log(`Gas used: ${deploymentGas.toString()}`);
  console.log(`L2 execution fee: ${(l2ExecutionFee / 1e9).toFixed(6)} ETH ($${(l2ExecutionFee / 1e9 * ETH_PRICE_USD).toFixed(2)} USD)`);
  console.log(`L1 data fee (approximation): ${l1DataFee.toFixed(6)} ETH ($${(l1DataFee * ETH_PRICE_USD).toFixed(2)} USD)`);
  console.log(`Total fee: ${totalFeeETH.toFixed(6)} ETH ($${totalFeeUSD.toFixed(2)} USD)`);
  
  return {
    gas: deploymentGas.toString(),
    l2Fee: l2ExecutionFee / 1e9,
    l1Fee: l1DataFee,
    totalETH: totalFeeETH,
    totalUSD: totalFeeUSD
  };
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);
  
  // Networks to estimate for
  const networks = ["optimism", "base", "unichain"];
  
  // Results storage
  const results = {};
  
  for (const network of networks) {
    console.log(`\n=== Estimating deployment costs on ${network.toUpperCase()} ===`);
    results[network] = {};
    
    // SuperchainPoints
    results[network].SuperchainPoints = await estimateGasForContract(
      "SuperchainPoints",
      [deployer.address, "Superchain Points", "SCP"],
      network
    );
    
    // SuperchainBadges
    results[network].SuperchainBadges = await estimateGasForContract(
      "SuperchainBadges",
      [deployer.address],
      network
    );
    
    // For SuperchainPointsRaffleFactory, we need addresses of the other contracts
    // We'll use dummy addresses for estimation
    const dummyPointsAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const dummyBadgesAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    
    results[network].SuperchainPointsRaffleFactory = await estimateGasForContract(
      "SuperchainPointsRaffleFactory",
      [deployer.address, dummyPointsAddress, dummyBadgesAddress],
      network
    );
    
    // Calculate total deployment cost for this network
    const totalGas = Object.values(results[network]).reduce((sum, result) => sum + parseInt(result.gas), 0);
    const totalETH = Object.values(results[network]).reduce((sum, result) => sum + result.totalETH, 0);
    const totalUSD = Object.values(results[network]).reduce((sum, result) => sum + result.totalUSD, 0);
    
    console.log(`\nTotal deployment cost on ${network.toUpperCase()}:`);
    console.log(`Total gas: ${totalGas}`);
    console.log(`Total fee: ${totalETH.toFixed(6)} ETH ($${totalUSD.toFixed(2)} USD)`);
  }
  
  // Generate markdown summary
  console.log("\n=== MARKDOWN SUMMARY ===\n");
  console.log("# L2 Deployment Cost Estimates\n");
  
  console.log("## Gas Usage\n");
  console.log("| Contract | Gas Used |");
  console.log("| --- | --- |");
  console.log(`| SuperchainPoints | ${results.optimism.SuperchainPoints.gas} |`);
  console.log(`| SuperchainBadges | ${results.optimism.SuperchainBadges.gas} |`);
  console.log(`| SuperchainPointsRaffleFactory | ${results.optimism.SuperchainPointsRaffleFactory.gas} |`);
  
  console.log("\n## Cost Estimates\n");
  console.log("| Network | Total Gas | L2 Execution Fee (ETH) | L1 Data Fee (ETH) | Total Fee (ETH) | Total Fee (USD) |");
  console.log("| --- | --- | --- | --- | --- | --- |");
  
  for (const network of networks) {
    const totalGas = Object.values(results[network]).reduce((sum, result) => sum + parseInt(result.gas), 0);
    const l2Fee = Object.values(results[network]).reduce((sum, result) => sum + result.l2Fee, 0);
    const l1Fee = Object.values(results[network]).reduce((sum, result) => sum + result.l1Fee, 0);
    const totalETH = l2Fee + l1Fee;
    const totalUSD = totalETH * ETH_PRICE_USD;
    
    console.log(`| ${network.charAt(0).toUpperCase() + network.slice(1)} | ${totalGas} | ${l2Fee.toFixed(6)} | ${l1Fee.toFixed(6)} | ${totalETH.toFixed(6)} | $${totalUSD.toFixed(2)} |`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
