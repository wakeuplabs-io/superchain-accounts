import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

const authenticatedSearchSchema = z.object({
  redirect: z.string().optional(),
});

// type AuthenticatedSearch = z.infer<typeof authenticatedSearchSchema>

export const Route = createFileRoute("/_authenticated")({
  validateSearch: authenticatedSearchSchema,
  beforeLoad: async ({ context,location }) => {
    if (!context.isLoggedIn) {
      throw redirect({
        to: "/login",
        search: {
        // Use the current location to power a redirect after login
        // (Do not use `router.state.resolvedLocation` as it can
        // potentially lag behind the actual current location)
          redirect: location.href,
        },
      });
    }
  },
});