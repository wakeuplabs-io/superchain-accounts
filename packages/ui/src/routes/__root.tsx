import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import envParsed from "@/envParsed";
import { Toaster } from "@/components/ui/toaster";
import { AuthContextType } from "@/hooks/use-auth";

const TanStackRouterDevtools = envParsed().PROD
  ? () => null // Render nothing in production
  : () => null;
  // : React.lazy(() =>
  //     import("@tanstack/router-devtools").then((res) => ({
  //       default: res.TanStackRouterDevtools,
  //     }))
  //   );

export const Route = createRootRouteWithContext<{
  auth: AuthContextType | null;
}>()({
  component: () => (
    <div className="w-screen h-screen">
      <main className="min-h-screen bg-gray-100">
        <Outlet />
        <Toaster />
      </main>
      <TanStackRouterDevtools />
    </div>
  ),
});
