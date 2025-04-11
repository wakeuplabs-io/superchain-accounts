import {
  createFileRoute,
  Outlet,
  redirect,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { z } from "zod";
import { LogOut, Lock, ScrollText, User } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

import opSuperchainLogo from "@/assets/logos/op-superchain-logo.png";
import wakeUpPowered from "@/assets/logos/wakeup-powered.svg";
import { ActionButton } from "@/components/_authenticated/sidebar/action-button";
import { AuthenticatedSidebarMenuButton } from "@/components/_authenticated/sidebar/authenticated-sidebar-menu-button";
import { useAuth } from "@/hooks/use-auth";
import { ClaimRaffleTicketsButton } from "@/components/_authenticated/sidebar/claim-raffle-tickets-button";
import { SuperChainAccountProvider } from "@/hooks/use-smart-account";
import { SuperchainRaffleProvider } from "@/hooks/use-superchain-raffle";

const authenticatedSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated")({
  validateSearch: authenticatedSearchSchema,
  beforeLoad: async ({ context, location }) => {
    const { auth } = context;

    if (!auth) {
      throw Error("AuthHandler not provided");
    }

    const isAuthenticated = await auth.initialize();

    if (!isAuthenticated) {
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
  component: AuthenticatedLayout,
  pendingComponent: () => (
    <div className="flex justify-center items-center h-screen w-screen">
      Loading...
    </div>
  ),
});

function AuthenticatedLayout() {
  const router = useRouter();
  const routerState = useRouterState();
  const { logout } = useAuth();

  const onLogout = async () => {
    await logout();
    router.history.push("/login");
  };

  return (
    <SuperChainAccountProvider>
      <SuperchainRaffleProvider>
          <SidebarProvider
            style={
              {
                "--sidebar-width": "20rem",
                "--sidebar-width-mobile": "20rem",
              } as React.CSSProperties
            }
          >
            <div className="flex w-full h-screen">
              <Sidebar className="w-80">
                <SidebarHeader className="px-8 py-12">
                  <SidebarMenu>
                    <SidebarMenuItem className="">
                      <img src={opSuperchainLogo} className="h-[30px]" />
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarHeader>
                <SidebarContent className="px-8">
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <AuthenticatedSidebarMenuButton
                        Icon={User}
                        text="Profile"
                        route="/profile"
                        isActive={routerState.location.pathname === "/profile"}
                      />
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <AuthenticatedSidebarMenuButton
                        Icon={ScrollText}
                        text="Accounts"
                        route="/"
                        isActive={routerState.location.pathname === "/"}
                      />
                    </SidebarMenuItem>
                  </SidebarMenu>
                  <hr className="my-4" />
                  <ClaimRaffleTicketsButton />
                </SidebarContent>
                <SidebarFooter>
                  <div className="flex flex-col px-8 py-14 gap-9">
                    <div className="flex gap-4">
                      {/* TODO: we need to redo this */}
                      <ActionButton
                        variant="dark"
                        icon={LogOut}
                        onClick={onLogout}
                      />
                      <ActionButton
                        variant="slate"
                        icon={Lock}
                        onClick={() => console.log("locking")}
                      />
                    </div>
                    <div className="h-[58px] bg-muted rounded-lg flex items-center justify-center">
                      <img className="h-[30px]" src={wakeUpPowered} />
                    </div>
                  </div>
                </SidebarFooter>
              </Sidebar>

              <main className="flex flex-1 overflow-auto p-8 lg:p-8">
                <div className="w-full flex flex-col gap-4">
                  <Outlet />
                </div>
              </main>
            </div>
          </SidebarProvider>
      </SuperchainRaffleProvider>
    </SuperChainAccountProvider>
  );
}
