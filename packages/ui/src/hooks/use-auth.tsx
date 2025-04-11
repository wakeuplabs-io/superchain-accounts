import { useContext } from "react";
import Torus, { TorusInpageProvider } from "@toruslabs/torus-embed";
import { createContext, ReactNode, useCallback, useRef } from "react";

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

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
        },
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
    return torus.current.provider;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: torus.current.isLoggedIn,
        initialize,
        login,
        logout,
        getProvider,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
