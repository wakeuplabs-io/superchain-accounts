import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";

import { RouterProvider } from "./hoc/router-provider.tsx";
import { QueryProvider } from "./hoc/query-provider.tsx";
import { Web3Provider } from "./hooks/use-web3.tsx";
import { AuthProvider } from "./hooks/use-auth.tsx";

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
