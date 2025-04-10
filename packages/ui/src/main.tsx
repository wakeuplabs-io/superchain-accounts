import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";

import { RouterProvider } from "./hoc/router-provider.tsx";
import { Web3Provider } from "./hoc/web3-provider.tsx";
import { QueryProvider } from "./hoc/query-provider.tsx";
import { AuthProvider } from "./hoc/auth-provider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProvider>
      <Web3Provider>
        <AuthProvider>
          <RouterProvider />
        </AuthProvider>
      </Web3Provider>
    </QueryProvider>
  </React.StrictMode>
);
