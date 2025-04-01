import Torus from "@toruslabs/torus-embed";
import { createContext, useContext, ReactNode, useRef, useEffect } from "react";
import { useWeb3 } from "./Web3Context";
import { Hex, hexToNumber } from "viem";

export interface AuthContextType {
  isAuthenticated: boolean;
  initialize: () => Promise<boolean>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ mode = "production" , children }: { children: ReactNode, mode?: "development" | "production" | "local" }) {
  const torus = useRef(new Torus({
    buttonPosition: "bottom-right",
  }));

  const { chain } = useWeb3();

  const initialize = async () => {
    const testEnvironment = mode === "development" || mode === "local";
    const showTorusButton = mode === "local";
    if (!torus.current.isInitialized) {
      console.log("initializing torus");
      await torus.current.init({
        showTorusButton: showTorusButton,
        network: {
          host: chain.rpcUrl,
          chainId: chain.id,
          networkName: chain.name,
        },
        enableLogging: testEnvironment,
        buildEnv: testEnvironment ? "testing" : "production",
      });
    }

    return torus.current.isLoggedIn;
  };

  const login = async () => {
    await torus.current.clearInit();
    await initialize();
    await torus.current.login();
  };

  const logout = async () =>  {
    if(!torus.current.isInitialized || !torus.current.isLoggedIn) {
      return;
    }

    await torus.current.logout();
  };

  useEffect(() => {
    if(!torus.current.isInitialized) {
      return;
    }

    const torusCurrentProvider = hexToNumber(torus.current.provider.chainId as Hex ?? "");

    if(torusCurrentProvider === chain.id) {
      return;
    }

    torus.current.setProvider({
      host: chain.rpcUrl,
      chainId: chain.id,
      networkName: chain.name,
    });
    //TODO: handle case when user rejects changing the chain in torus auth, in this case we should revert to the previous chain
  }, [chain]);


  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: torus.current.isLoggedIn,
        initialize,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

