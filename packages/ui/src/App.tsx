import { router } from "@/shared/config/tanstackRouter";
import { RouterProvider } from "@tanstack/react-router";
import { useMockAuth } from "./contexts/MockAuthContext";
import { useSuperChainStore } from "./store";


function App() {
  const store = useSuperChainStore();

  console.log(store);
  const {isLoggedIn} = useMockAuth();
  return <RouterProvider router={router} context={{isLoggedIn}} />;
}

export default App;
