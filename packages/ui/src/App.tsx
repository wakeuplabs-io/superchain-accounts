import { router } from "@/shared/config/tanstackRouter";
import { RouterProvider } from "@tanstack/react-router";
import { useSuperChainStore } from "./core/store";

function App() {
  const authHandler = useSuperChainStore((state => state.authHandler));

  return <RouterProvider router={router} context={{authHandler}} />;
}

export default App;
