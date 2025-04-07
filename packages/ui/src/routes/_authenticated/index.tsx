import { useSuperChainAccount } from "@/context/SmartAccountContext";
import { createFileRoute } from "@tanstack/react-router";
import { formatEther } from "viem";

export const Route = createFileRoute("/_authenticated/")({
  component: Index,
});

function Index() {
  const { account } = useSuperChainAccount();
  
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
      <p><b>Account Balance:</b> {formatEther(account.balance)} ETH</p>
    </div>
  );
  
}
