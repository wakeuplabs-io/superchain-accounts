import { useWeb3 } from "@/hooks/use-web3";
import Torus, { TorusInpageProvider } from "@toruslabs/torus-embed";
import { createContext, ReactNode, useRef } from "react";

export interface AuthContextType {
  isAuthenticated: boolean;
  initialize: () => Promise<boolean>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getProvider: () => TorusInpageProvider;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const torus = useRef(
    new Torus({
      buttonPosition: "bottom-right",
    })
  );

  const { chain } = useWeb3();

  const initialize = async () => {
    if (!torus.current.isInitialized) {
      await torus.current.init({
        showTorusButton: false,
        network: {
          host: chain.rpcUrl,
          chainId: chain.data.id,
          networkName: chain.data.name,
        },
        enableLogging: false,
        buildEnv: "production",
      });
    }

    return torus.current.isLoggedIn;
  };

  const login = async () => {
    await torus.current.clearInit();
    await initialize();
    await torus.current.login();
  };

  const logout = async () => {
    if (!torus.current.isInitialized || !torus.current.isLoggedIn) {
      return;
    }

    await torus.current.logout();
  };

  const getProvider = () => {
    return torus.current.provider;
  };

  const value = {
    isAuthenticated: torus.current.isLoggedIn,
    initialize,
    login,
    logout,
    getProvider,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
