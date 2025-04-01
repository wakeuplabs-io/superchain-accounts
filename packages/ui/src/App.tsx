import { router } from "@/shared/config/tanstackRouter";
import { RouterProvider } from "@tanstack/react-router";
import { Web3Provider } from "./context/Web3Context";
import { AuthProvider, useAuth } from "./context/AuthContext";

function InnerApp() {
  return <RouterProvider router={router} context={{
    auth: useAuth()
  }} />;
}

function App() {
  return (
    <Web3Provider>
      <AuthProvider>
        <InnerApp />
      </AuthProvider>
    </Web3Provider>
  );
}

export default App;
