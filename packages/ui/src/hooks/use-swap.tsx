import uniswapFactory from "@/config/abis/uniswap-factory";
import { Address, encodeFunctionData, erc20Abi, getContract } from "viem";
import { useWeb3 } from "./use-web3";
import { useCallback, useMemo, useState } from "react";
import uniswapQuoter from "@/config/abis/uniswap-quoter";
import uniswapPool from "@/config/abis/uniswap-pool";
import { useSuperChainAccount } from "./use-smart-account";
import uniswapRouter from "@/config/abis/uniswap-router";
import { useUserTokens } from "./use-user-tokens";

export const useSwap = () => {
  const { chain } = useWeb3();
  const { sendTransaction, account } = useSuperChainAccount();
  const { invalidateUserTokens } = useUserTokens();

  const factoryContract = useMemo(() => {
    return getContract({
      abi: uniswapFactory,
      client: chain.client,
      address: chain.uniswapFactoryAddress,
    });
  }, [chain]);

  const quoterContract = useMemo(() => {
    return getContract({
      abi: uniswapQuoter,
      client: chain.client,
      address: chain.uniswapQuoterAddress,
    });
  }, [chain]);

  const quote = useCallback(
    async (tokenIn: Address, tokenOut: Address, amountIn: bigint) => {
      if (amountIn === 0n) {
        return 0n;
      }

      const poolAddress = await factoryContract.read.getPool([
        tokenIn,
        tokenOut,
        3000,
      ]);
      const poolContract = getContract({
        abi: uniswapPool,
        client: chain.client,
        address: poolAddress,
      });
      const fee = await poolContract.read.fee();

      const quotedAmountOut =
        await quoterContract.simulate.quoteExactInputSingle([
          {
            tokenIn,
            tokenOut,
            fee,
            amountIn,
            sqrtPriceLimitX96: 0n,
          },
        ]);

      return quotedAmountOut.result[0];
    },
    [factoryContract]
  );

  const swap = useCallback(
    async (
      tokenIn: Address,
      tokenOut: Address,
      amountIn: bigint,
      amountOutMinimum: bigint
    ) => {
      // TODO: if eth wrap it
      // TODO: all in batched tx

      const poolAddress = await factoryContract.read.getPool([
        tokenIn,
        tokenOut,
        3000,
      ]);
      const poolContract = getContract({
        abi: uniswapPool,
        client: chain.client,
        address: poolAddress,
      });
      const fee = await poolContract.read.fee();

      const approveTx = await sendTransaction({
        to: tokenIn,
        value: 0n,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [chain.uniswapRouterAddress, amountIn],
        }),
      });

      const swapTx = await sendTransaction({
        to: chain.uniswapRouterAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: uniswapRouter,
          functionName: "exactInputSingle",
          args: [
            {
              tokenIn,
              tokenOut,
              fee,
              recipient: account.address,
              amountIn: amountIn,
              amountOutMinimum,
              sqrtPriceLimitX96: 0n,
            },
          ],
        }),
      });

      await invalidateUserTokens();

      return { approveTx, swapTx };
    },
    [chain]
  );

  return {
    quote,
    swap,
  };
};
