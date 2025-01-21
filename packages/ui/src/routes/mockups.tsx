// src/routes/mockups.tsx
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/mockups")({
  component: MockupsLayout,
});

function MockupsLayout() {
  return (
    <div className="mockups-layout">
      <Outlet />
    </div>
  );
}
