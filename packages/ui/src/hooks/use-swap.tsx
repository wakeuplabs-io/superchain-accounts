import uniswapFactory from "@/config/abis/uniswap-factory";
import { Address, encodeFunctionData, getContract } from "viem";
import { useWeb3 } from "./use-web3";
import { useCallback, useMemo, useState } from "react";
import uniswapQuoter from "@/config/abis/uniswap-quoter";
import uniswapPool from "@/config/abis/uniswap-pool";
import { useSuperChainAccount } from "./use-smart-account";
import uniswapRouter from "@/config/abis/uniswap-router";
import { useUserTokens } from "./use-user-tokens";

export const useSwap = () => {
  const { chain } = useWeb3();
  const [isPending, setIsPending] = useState(false);
  const { sendTransaction, account } = useSuperChainAccount();
  const { invalidateUserTokens } = useUserTokens()

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
      setIsPending(true);

      try {
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
      } catch (e) {
        console.error(e);
        throw e;
      } finally {
        setIsPending(false);
      }
    },
    [factoryContract]
  );

  const swap = useCallback(
    async (
      tokenIn: Address,
      tokenOut: Address,
      amountIn: bigint,
      amountOutMinimum: bigint,
    ) => {
      // TODO: if eth wrap it
      // TODO: approve
      // TODO: swap
      // TODO: all in batched tx

      setIsPending(true);

      try {
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

        // const approveTx = await sendTransaction({
        //   to: tokenIn,
        //   value: 0n,
        //   data: encodeFunctionData({
        //     abi: erc20Abi,
        //     functionName: "approve",
        //     args: [chain.uniswapRouterAddress, maxUint256],
        //   }),
        // });

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

        return { approveTx: null, swapTx };
      } catch (e) {
        console.error(e);
        throw e;
      } finally {
        setIsPending(false);
      }
    },
    [chain]
  );

  return {
    quote,
    swap,
    isPending,
  };
};
