import { createRootRoute, Outlet } from "@tanstack/react-router";
import React from "react";

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null // Render nothing in production
    : React.lazy(() =>
      import("@tanstack/router-devtools").then((res) => ({
        default: res.TanStackRouterDevtools,
      }))
    );

export const Route = createRootRoute({
  component: () => (
    <div className="w-screen h-screen flex flex-col">
      <main className="min-h-screen bg-gray-100">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </div>
  ),
});
