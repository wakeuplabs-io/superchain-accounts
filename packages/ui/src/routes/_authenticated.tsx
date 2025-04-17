import {
  createFileRoute,
  Outlet,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import { z } from "zod";
import { ScrollText, User } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import opSuperchainLogo from "@/assets/logos/op-superchain-logo.png";
import wakeUpPowered from "@/assets/logos/wakeup-powered.svg";
import { AuthenticatedSidebarMenuButton } from "@/components/sidebar/authenticated-sidebar-menu-button";
import { ClaimRaffleTicketsButton } from "@/components/sidebar/claim-raffle-tickets-button";
import { SuperChainAccountProvider } from "@/hooks/use-smart-account";
import { AccountButton } from "@/components/sidebar/account-button";
import { LogoutButton } from "@/components/sidebar/logout-button";

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
  const routerState = useRouterState();

  return (
    <SuperChainAccountProvider>
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
                    route="/accounts"
                    isActive={routerState.location.pathname === "/accounts"}
                  />
                </SidebarMenuItem>
              </SidebarMenu>
              <hr className="my-4" />
              <ClaimRaffleTicketsButton />
            </SidebarContent>
            <SidebarFooter className="flex flex-col px-8 py-14 gap-4">
              <LogoutButton />
              <AccountButton />

              <hr className="border-sidebar-accent" />

              <div className="h-[58px] bg-sidebar-accent rounded-lg flex items-center justify-center">
                <img className="h-full" src={wakeUpPowered} />
              </div>
            </SidebarFooter>
          </Sidebar>

          <main className="bg-[linear-gradient(-21deg,_#FFFFFF,_#F3F3F3)] lg:bg-[linear-gradient(-57deg,_#FFFFFF,_#F3F3F3)] w-full">
            <div className="md:hidden w-full flex items-end justify-start h-[114px] px-6 py-4 bg-[linear-gradient(-72deg,_#FFFFFF,_#F3F3F3)]">
              <SidebarTrigger />
            </div>

            <div className="w-full flex flex-col gap-4 p-6 lg:p-8">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </SuperChainAccountProvider>
  );
}
