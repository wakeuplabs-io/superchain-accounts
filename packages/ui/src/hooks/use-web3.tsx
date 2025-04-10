import { Web3Context } from "@/hoc/web3-provider";
import { useContext } from "react";

export function useWeb3() {
    const context = useContext(Web3Context);
    if (context === undefined) {
      throw new Error("useWeb3 must be used within a Web3Provider");
    }
    return context;
  }
  