import { useSuperChainStore } from "@/core/store";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SmartAccount } from "viem/account-abstraction";

export const Route = createFileRoute("/_authenticated/")({
  component: Index,
});

function Index() {
  const smartAccountHandler  = useSuperChainStore(state => state.smartAccountHandler);
  const authHandler = useSuperChainStore(state => state.authHandler);
  const [smartAccount, setSmartAccount] = useState<SmartAccount>();
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    setIsInitializing(true);
    smartAccountHandler.initialize(authHandler.getProvider()).then(setSmartAccount).finally(() => setIsInitializing(false));
  }, []);

  useEffect(() => {
    if(!smartAccount) {
      return;
    }
    smartAccount?.isDeployed().then(result => console.log("isDeployed", result));
  }, [smartAccount]);

  return (
    <div className="flex flex-1 flex-col  items-center justify-center">
      <h2>Home Page</h2>
      {isInitializing && <h3>Initializing smart account, please confirm the transaction in your wallet...</h3>}
      {smartAccount && <h3>Smart Account: {smartAccount.address.toString()}</h3>}
    </div>
  );
}
