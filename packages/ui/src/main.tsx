import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";

import { RouterProvider } from "./hoc/router-provider.tsx";
import { QueryProvider } from "./hoc/query-provider.tsx";
import { Web3Provider } from "./hooks/use-web3.tsx";
import { AuthProvider } from "./hooks/use-auth.tsx";
import { WalletConnectProvider } from "./hooks/use-wallet-connect.tsx";
import { WalletWrapper } from "./hoc/wallet-connect-provider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProvider>
      <Web3Provider>
        <AuthProvider>
          <WalletWrapper>
            <WalletConnectProvider>
              <RouterProvider />
            </WalletConnectProvider>
          </WalletWrapper>
        </AuthProvider>
      </Web3Provider>
    </QueryProvider>
  </React.StrictMode>
);
