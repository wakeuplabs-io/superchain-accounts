import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SmartAccount } from "viem/account-abstraction";
import { useSuperChainStore } from "@/core/store";

export const Route = createFileRoute("/_authenticated/")({
  component: Index,
});

function Index() {
  const smartAccountHandler  = useSuperChainStore(state => state.smartAccountHandler);
  const authHandler = useSuperChainStore(state => state.authHandler);
  const web3Client = useSuperChainStore(state => state.web3Client);
  const [smartAccount, setSmartAccount] = useState<SmartAccount>();
  const [isInitializing, setIsInitializing] = useState(false);
  const [accountBalance, setAccountBalance] = useState<string>("");

  useEffect(() => {
    setIsInitializing(true);
    smartAccountHandler.initialize(authHandler.getProvider()).then(setSmartAccount).finally(() => setIsInitializing(false));
  }, []);

  useEffect(() => {
    async function getSmartAccountBalance(smartAccount: SmartAccount): Promise<string> {
      const isDeployed = await smartAccount?.isDeployed();
      if(!isDeployed) {
        console.log("Smart account not deployed");
        return "0";
      }

      console.log("Getting balance for smart account", smartAccount.address);
      return web3Client.getBalance(smartAccount.address);
    }

    if(!smartAccount) {
      return;
    }

    getSmartAccountBalance(smartAccount).then(setAccountBalance);
  }, [smartAccount, web3Client]);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-3xl font-bold">Accounts</p>
      {isInitializing && <p className="text-xl">Initializing smart account, please confirm the transaction in your wallet...</p>}
      {smartAccount && (
        <>
          <p><b>Smart Account Address:</b> {smartAccount.address.toString()}</p>
          <p><b>Account Balance:</b> {accountBalance} ETH</p>
        </>
      )}
    </div>
  );
}
