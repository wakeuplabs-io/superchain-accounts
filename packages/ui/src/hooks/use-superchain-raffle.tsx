import envParsed from "@/envParsed";
import { zeroAddress } from "viem";
import { useWeb3 } from "./use-web3";
import { useEffect, useState } from "react";
import superchainPointsRaffleFactory from "@/config/abis/superchain-points-raffle-factory";
import superchainPointsRaffle from "@/config/abis/superchain-points-raffle";
import { useSuperChainAccount } from "./use-smart-account";

export const useSuperchainRaffle = () => {
  const { chain } = useWeb3();
  const {
    account: { address },
  } = useSuperChainAccount();
  const [isPending, setIsPending] = useState(false);
  const [claimableTickets, setClaimableTickets] = useState(0);

  useEffect(() => {
    async function getClaimableTickets() {
      console.log("getClaimableTickets", chain.id, address)

      if (!chain || !address) {
        return;
      }

      // from factory ready current raffle
      const currentRaffle = await chain.client.readContract({
        address: envParsed().SUPERCHAIN_POINTS_RAFFLE_FACTORY_ADDRESS as `0x${string}`,
        functionName: "currentRaffle",
        abi: superchainPointsRaffleFactory,
        args: [],
      });
      if (!currentRaffle || currentRaffle === zeroAddress) {
        return setClaimableTickets(0);
      }

      // read at raffle contract claimable tickets
      const claimableTickets = await chain.client.readContract({
        address: currentRaffle as `0x${string}`,
        functionName: "getClaimableTickets",
        abi: superchainPointsRaffle,
        args: [address],
      });

      setClaimableTickets(Number(claimableTickets));
    }

    setIsPending(true);
    setClaimableTickets(0);
    getClaimableTickets()
      .catch((e) => console.log("Error getting claimable tickets", e))
      .finally(() => setIsPending(false));
  }, [address, chain]);

  return {
    isPending,
    claimableTickets,
  };
};
