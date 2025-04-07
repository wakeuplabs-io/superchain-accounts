import { RouterProvider as TanstackRouterProvider } from "@tanstack/react-router";
import { router } from "@/shared/config/tanstackRouter";
import { useAuth } from "@/context/AuthContext";


export function RouterProvider() {
  const auth = useAuth();
  return (
    <TanstackRouterProvider router={router} context={{
      auth: auth
    }} />
  );
}