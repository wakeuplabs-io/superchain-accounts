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

  useEffect(() => {
    smartAccountHandler.getSmartAccount(authHandler.getProvider()).then(setSmartAccount);
  }, []);

  return (
    <div className="flex flex-1 flex-col  items-center justify-center">
      <h2>Home Page</h2>
      {smartAccount && <h3>Smart Account: {smartAccount.address.toString()}</h3>}
    </div>
  );
}
