# Superchain Contracts

Project that contains all the necessary contracts for implementing the ERC-4337 standard

## Deployed Addresses

Find deployed contracts within the ignition deployment framework

## Useful commands

To compile the contracts, run the following command:

```bash
npm run build
```

To test the contracts, run the following command:

```bash
npm test
```

## Hardhat tasks

```bash
npx hardhat --help

# AVAILABLE TASKS:

#   add-claimable-badge   Adds a claimable badge to user
#   claim-badge           Claims badge
#   mint-badge            Mints badge to a specified address
#   set-badge-uri         Sets badge uri

#   add-claimable-points  Adds claimable points to user 
#   claim-points          Claims points
#   mint-points           Mints points to a specified address
  
#   start-raffle          Starts a raffle
#   finish-raffle         Finishes a raffle
#   claim-raffle          Claim raffle tickets

#   ...
```

### Examples:


`mint-points`
```bash
npx hardhat mint-points --to 0xF754D0f4de0e815b391D997Eeec5cD07E59858F0 --amount 1 --network optimism-sepolia
Minting 1 points to 0xF754D0f4de0e815b391D997Eeec5cD07E59858F0
Points minted with tx: 0xe76cad0a39096ce29e8663996513006a399a77cf1d7f3b0b8ac05cc74b215d2d
```

`add-claimable-points`

```bash
npx hardhat add-claimable-points --to 0xF754D0f4de0e815b391D997Eeec5cD07E59858F0 --amount 2 --network optimism-sepolia
Adding 2 points to 0xF754D0f4de0e815b391D997Eeec5cD07E59858F0
Points added with tx: 0x253f80688f87889f447dd13231b42053dad3550a9de89352b13cd816e1db3a74
```

`claim-points`

```bash
npx hardhat claim-points --network optimism-sepolia
Claiming points
Points claimed with tx: 0x84cda81ad41e557ebaa379832b5c0c287391661a75745baf41f38d6894941391
```

`mint-badge`

```bash
npx hardhat mint-badge --to 0xF754D0f4de0e815b391D997Eeec5cD07E59858F0 --id 1 --network optimism-sepolia
Minting badge 1 to 0xF754D0f4de0e815b391D997Eeec5cD07E59858F0
Badge minted with tx: 0x9a5ca7d2791acb9220d61ba51271c5806413ad05524c6be5deb987f3b011fdfd
```

`add-claimable-badge`

```bash
npx hardhat add-claimable-badge --to 0xF754D0f4de0e815b391D997Eeec5cD07E59858F0 --id 2 --network optimism-sepolia
Adding badge 2 to 0xF754D0f4de0e815b391D997Eeec5cD07E59858F0
Badge added with tx: 0x720456173a135d1b4944a76f09dfbd78c90e6a18215e101833d0f3784934243b
```

`claim-badge`

```bash
npx hardhat claim-badge --id 2 --network optimism-sepolia
Claiming badge 2
Badge claimed with tx: 0xdeac6f12b963374bad6cf25ceefdc4a1ee6fe113668790e3b6a8096ea7e1e131
```

`start-raffle`

```bash
npx hardhat start-raffle --prize 100 --badges 1,2 --allocations 10,100 --reveal-after 1744395532287 --network optimism-sepolia
Minting 100 points to 0xF754D0f4de0e815b391D997Eeec5cD07E59858F0 for raffle deposit...
Points minted with tx: 0xcca0b761cdbc1e116a78922266d7c6e22864f49b06bf2c58e1677a37febc06bf
Creating raffle...
Raffle created with tx:  0x308b62503ea78c5f6b1d60ec0677f7d3fbb9ef6240f2f1ef504f9640c530d315
Approving raffle...
Approved
Raffle seed: 0x15f7fc01e4bc6497d5a6eb78d11a1012311d4f7cdf1c63f2d2c9a9342c5e73db
Keep it safe, you'll need it later for revelation!
Starting raffle...
Raffle started with tx: 0xfaaf11bca76e3389800aee43b5d48d031ec6bcab90f73dacccc384ce1cc0ed5f
```

`claim-raffle`

```bash
npx hardhat claim-raffle --network optimism-sepolia
Claiming raffle tickets
Claimed with tx: 0x8069360198d85dad96f8698ca249c325d420465f077afa504cd0c715839037c0
```

`finish-raffle`

```bash
npx hardhat finish-raffle --seed 0x15f7fc01e4bc6497d5a6eb78d11a1012311d4f7cdf1c63f2d2c9a9342c5e73db --network optimism-sepolia
Revealing winner
Winner revealed with tx: 0xbf4a0ecd8969ea360db28a0669ea57d1f8eee8119c5db58025fe192b0dd79915
```
