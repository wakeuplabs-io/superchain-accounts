const hre = require("hardhat");

async function main() {
  console.log("Estimating gas for contract deployments...");
  
  // Get signers
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);
  
  // Deploy SuperchainPoints
  console.log("\nDeploying SuperchainPoints...");
  const SuperchainPoints = await hre.ethers.getContractFactory("SuperchainPoints");
  const superchainPoints = await SuperchainPoints.deploy(
    deployer.address,
    "Superchain Points",
    "SCP"
  );
  await superchainPoints.waitForDeployment();
  const superchainPointsAddress = await superchainPoints.getAddress();
  console.log(`SuperchainPoints deployed to: ${superchainPointsAddress}`);
  
  // Deploy SuperchainBadges
  console.log("\nDeploying SuperchainBadges...");
  const SuperchainBadges = await hre.ethers.getContractFactory("SuperchainBadges");
  const superchainBadges = await SuperchainBadges.deploy(deployer.address);
  await superchainBadges.waitForDeployment();
  const superchainBadgesAddress = await superchainBadges.getAddress();
  console.log(`SuperchainBadges deployed to: ${superchainBadgesAddress}`);
  
  // Deploy SuperchainPointsRaffleFactory
  console.log("\nDeploying SuperchainPointsRaffleFactory...");
  const SuperchainPointsRaffleFactory = await hre.ethers.getContractFactory("SuperchainPointsRaffleFactory");
  const superchainPointsRaffleFactory = await SuperchainPointsRaffleFactory.deploy(
    deployer.address,
    superchainPointsAddress,
    superchainBadgesAddress
  );
  await superchainPointsRaffleFactory.waitForDeployment();
  const superchainPointsRaffleFactoryAddress = await superchainPointsRaffleFactory.getAddress();
  console.log(`SuperchainPointsRaffleFactory deployed to: ${superchainPointsRaffleFactoryAddress}`);
  
  // Create a raffle
  console.log("\nCreating a raffle...");
  const createRaffleTx = await superchainPointsRaffleFactory.createRaffle();
  await createRaffleTx.wait();
  const raffleAddress = await superchainPointsRaffleFactory.currentRaffle();
  console.log(`Raffle created at: ${raffleAddress}`);
  
  console.log("\nDeployment complete. Check the gas report for detailed gas usage.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
