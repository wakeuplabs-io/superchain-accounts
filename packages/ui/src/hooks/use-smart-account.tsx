import { SuperChainAccountContext } from "@/hoc/smart-account-provider";
import { useContext } from "react";

export function useSuperChainAccount() {
  const context = useContext(SuperChainAccountContext);
  if (context === undefined) {
    throw new Error(
      "useSuperChainAccount must be used within a SuperchainAccountProvider"
    );
  }
  return context;
}
