import Torus, { TorusInpageProvider } from "@toruslabs/torus-embed";
import { createContext, ReactNode, useCallback, useEffect, useRef } from "react";

export interface AuthContextType {
  isAuthenticated: boolean;
  initialize: () => Promise<boolean>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getProvider: () => TorusInpageProvider;
  torus: React.MutableRefObject<Torus>
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

  const initialize = useCallback(async () => {
    if (!torus.current.isInitialized) {
      await torus.current.init({
        showTorusButton: false,
        enableLogging: false,
        buildEnv: "production",
        network: {
          host: "https://sepolia.optimism.io",
          chainId: 11155420,
          networkName: "Optimism Sepolia",
        }
      });
    }

    return torus.current.isLoggedIn;
  }, [torus.current]);

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
    // if (!torus.current.isInitialized) {
    //   await initialize();
    // }
    return torus.current.provider;
  };

  // useEffect(() => {
  //   initialize();
  // }, [torus]);

  const value = {
    isAuthenticated: torus.current.isLoggedIn,
    initialize,
    login,
    logout,
    getProvider,
    torus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
