import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import React from "react";
import envParsed from "@/envParsed";
import { Toaster } from "@/components/ui/toaster";
import { AuthContextType } from "@/hoc/auth-provider";

const TanStackRouterDevtools = envParsed().PROD
  ? () => null // Render nothing in production
  : React.lazy(() =>
      import("@tanstack/router-devtools").then((res) => ({
        default: res.TanStackRouterDevtools,
      }))
    );

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
