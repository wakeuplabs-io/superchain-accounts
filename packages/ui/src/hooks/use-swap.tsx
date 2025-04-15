import uniswapFactory from "@/config/abis/uniswap-factory";
import { Address, getContract } from "viem";
import { useWeb3 } from "./use-web3";
import { useCallback, useMemo, useState } from "react";
import uniswapQuoter from "@/config/abis/uniswap-quoter";
import uniswapPool from "@/config/abis/uniswap-pool";

export const useSwap = () => {
  const { chain } = useWeb3();
  const [isPending, setIsPending] = useState(false);

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
          return 0n
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
              // recipient: zeroAddress,
              // deadline: Math.floor(new Date().getTime() / 1000 + 60 * 10),
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

  const swap = useCallback(() => {
    // TODO: if eth wrap it
    // TODO: approve
    // TODO: swap
  }, []);

  return {
    quote,
    swap,
    isPending,
  };
};
