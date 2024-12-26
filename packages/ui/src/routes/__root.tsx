
import { TorusAuthHandler } from "@/core/auth";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import React from "react";
import envParsed from "@/envParsed";

const TanStackRouterDevtools =
  envParsed().PROD
    ? () => null // Render nothing in production
    : React.lazy(() =>
      import("@tanstack/router-devtools").then((res) => ({
        default: res.TanStackRouterDevtools,
      }))
    );

export const Route = createRootRouteWithContext<{authHandler: TorusAuthHandler | null}>()({
  component: () => (
    <div className="w-screen h-screen flex flex-col">
      <main className="min-h-screen bg-gray-100">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </div>
  ),
});
