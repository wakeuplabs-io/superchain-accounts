// src/routes/mockups/welcome.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Welcome } from "@/components/ui/welcome";

export const Route = createFileRoute("/mockups/welcome")({
  component: WelcomeMockup,
});

function WelcomeMockup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Welcome />
    </div>
  );
}
