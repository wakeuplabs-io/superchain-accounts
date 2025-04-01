import { router } from "@/shared/config/tanstackRouter";
import { RouterProvider } from "@tanstack/react-router";
import { useSuperChainStore } from "./core/store";
import { Web3Provider } from "./context/Web3Context";

function InnerApp() {
  const authHandler = useSuperChainStore((state => state.authHandler));

  return <RouterProvider router={router} context={{authHandler}} />;
}

function App() {
  return (
    <Web3Provider>
      <InnerApp />
    </Web3Provider>
  );
}

export default App;
