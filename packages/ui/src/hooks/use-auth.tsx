import { useContext } from "react";
import Torus, { TorusInpageProvider } from "@toruslabs/torus-embed";
import { createContext, ReactNode, useCallback, useRef } from "react";
import { Hex, hexToNumber } from "viem";
import { ChainMetadata } from "@/config/chains";
import { useWeb3 } from "./use-web3";

export interface AuthContextType {
  isAuthenticated: boolean;
  initialize: () => Promise<boolean>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getProvider: () => TorusInpageProvider;
  updateProviderChain: (chain: ChainMetadata) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { chain } = useWeb3();
  const torus = useRef(
    new Torus({
      buttonPosition: "bottom-right",
    })
  );

  const initialize = useCallback(async () => {
    if (!torus.current.isInitialized) {
      await torus.current.init({
        showTorusButton: false,
        enableLogging: false,
        buildEnv: "production",
        network: {
          host: chain.rpcUrl,
          chainId: chain.id,
          networkName: chain.name,
        },
      });
    }

    return torus.current.isLoggedIn;
  }, [torus.current, chain]);

  const login = useCallback(async () => {
    await torus.current.clearInit();
    await initialize();
    await torus.current.login();
  }, [initialize, torus]);

  const logout = useCallback(async () => {
    if (!torus.current.isInitialized || !torus.current.isLoggedIn) {
      return;
    }

    await torus.current.logout();
  }, [torus]);

  const getProvider = () => {
    return torus.current.provider;
  };

  const updateProviderChain = async (chain: ChainMetadata) => {
    if (
      hexToNumber((torus.current.provider.chainId ?? "0x") as Hex) === chain.id
    ) {
      return;
    }

    return torus.current.setProvider({
      host: chain.rpcUrl,
      chainId: chain.id,
      networkName: chain.name,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: torus.current.isLoggedIn,
        initialize,
        login,
        logout,
        getProvider,
        updateProviderChain,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
