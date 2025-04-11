import { useContext } from "react";
import {
  ChainMetadata,
  DEFAULT_CHAIN_ID,
  supportedChains,
} from "@/config/chains";
import { createContext, ReactNode, useState, useMemo } from "react";

interface Web3ContextType {
  chain: ChainMetadata;
  currentChainId: number;
  setCurrentChainId: (chainId: number) => void;
}

export const Web3Context = createContext<Web3ContextType | undefined>(
  undefined
);

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}

export function Web3Provider({ children }: { children: ReactNode }) {
  const [currentChainId, setCurrentChainId] = useState(DEFAULT_CHAIN_ID);

  const chain = useMemo(() => {
    return supportedChains[currentChainId];
  }, [currentChainId]);

  return (
    <Web3Context.Provider
      value={{
        chain,
        currentChainId,
        setCurrentChainId,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}
