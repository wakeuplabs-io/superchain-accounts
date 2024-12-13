import { router } from "@/shared/config/tanstackRouter";
import { RouterProvider } from "@tanstack/react-router";
import { useMockAuth } from "./contexts/MockAuthContext";

function App() {
  const {isLoggedIn} = useMockAuth();
  return <RouterProvider router={router} context={{isLoggedIn}} />;
}

export default App;
