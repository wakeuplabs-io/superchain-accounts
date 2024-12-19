import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/profile")({
  component: Profile,
});

function Profile() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <h3>Profile Page</h3>
    </div>
  );
}
