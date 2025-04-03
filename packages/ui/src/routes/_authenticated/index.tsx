import { Button } from "@/components";
import { useSuperChainAccount } from "@/context/SmartAccountContext";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { formatEther } from "viem";

export const Route = createFileRoute("/_authenticated/")({
  component: Index,
});

function Index() {
  const { account, deploySmartAccount } = useSuperChainAccount();
  const [isDeploying, setIsDeploying] = useState(false);
 
  const deployAccount = async () => {
    setIsDeploying(true);
    await deploySmartAccount();
    setIsDeploying(false);
  };

  
  // //TODO: IMPROVE THIS CODE
  if(account.status === "pending") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-3xl font-bold">Account</p>
        <p className="text-xl">Initializing smart account</p>
      </div> 
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-3xl font-bold">Accounts</p>
      <p><b>Smart Account Address:</b> {account.instance.address.toString()}</p>
      {account.status === "deployed" ? <p><b>Account Balance:</b> {formatEther(account.balance)} ETH</p> : (
        <div className="flex flex-row gap-2 items-center">
          <span>Smart account not deployed, click the next button to deploy it and confirm the transaction in your wallet.</span>
          <Button size='sm' onClick={deployAccount} loading={isDeploying}>Deploy Account</Button>
        </div>
      )}
    </div>
  );
  
}
