import { useCallback, useEffect, useState } from "react";
import { useWeb3 } from "./use-web3";

export const useSuperchainRaffle = () => {
  const { publicClient } = useWeb3();
  const [isPending, setIsPending] = useState(false);
  const [claimableTickets, setClaimableTickets] = useState(0);

  const claimTickets = useCallback(() => {
    // TODO: To be DONE at OSA-85
  }, []);

  useEffect(() => {
    async function getClaimableTickets() {
      if (!publicClient) {
        return;
      }

    //   TODO: from factory ready current raffle
      // const claimableTickets = await publicClient.readContract({
      //     address: envVars.SUPERCHAIN_RAFFLE_ADDRESS as Address,
      //     functionName: "claimableTickets",
      //     args: [],
      //     chain: supportedChains[DEFAULT_CHAIN_ID].data,
      // })

    //   read at raffle contract claimable tickets
    }

    setIsPending(true);
    getClaimableTickets().finally(() => setIsPending(false));
  }, []);

  return {
    isPending,
    claimTickets,
    claimableTickets,
  };
};
