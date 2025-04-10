import { RouterProvider as TanstackRouterProvider } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";
import { createRouter } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

export const router = createRouter({
  routeTree,
  context: {
    auth: null,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function RouterProvider() {
  const auth = useAuth();

  return <TanstackRouterProvider router={router} context={{ auth: auth }} />;
}
