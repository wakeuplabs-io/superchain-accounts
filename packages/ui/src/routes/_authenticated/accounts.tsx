import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/accounts")({
  component: Accounts,
});

function Accounts() {
  return(
    <div className="flex flex-1 items-center justify-center">
      <h3>Accounts Page</h3>
    </div>
  );
}
