import { createFileRoute, Outlet, redirect, useRouter} from "@tanstack/react-router";
import { z } from "zod";
import { LogOut, Lock, ScrollText } from "lucide-react";

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

import optimismLogo from "@/assets/logos/optimism-logo.svg";
import wakeUpPowered from "@/assets/logos/wakeup-powered.svg";
import { ActionButton} from "@/components/_authenticated/sidebar/action-button";
import { AuthenticatedSidebarMenuButton } from "@/components/_authenticated/sidebar/authenticated-sidebar-menu-button";
import { useAuth } from "@/context/AuthContext";
import { SuperChainAccountProvider } from "@/context/SmartAccountContext";

const authenticatedSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated")({
  validateSearch: authenticatedSearchSchema,
  beforeLoad: async ({ context, location }) => {
    const {auth} = context;

    if(!auth) {
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
  // TODO: Add a pending component
  pendingComponent: () => <span>Loading...</span>,
});

function AuthenticatedLayout() {
  const router = useRouter();
  const { logout } =  useAuth();

  const onLogout = async() => {
    await logout();
    router.history.push("/login");
  };

  return (
    <SuperChainAccountProvider>
      <SidebarProvider style={{
        "--sidebar-width": "20rem",
        "--sidebar-width-mobile": "20rem",
      } as React.CSSProperties}>
        <div className="flex w-full h-screen">
          <Sidebar className="w-80">
            <SidebarHeader className="px-8 py-14">
              <SidebarMenu>
                <SidebarMenuItem className="flex justify-center">
                  <img src={optimismLogo} className="w-[135px]" />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="px-8">
              <SidebarMenu>
                <SidebarMenuItem>
                  {/* <AuthenticatedSidebarMenuButton
                  Icon={User}
                  text="Profile"
                  route="/profile"
                /> */}
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <AuthenticatedSidebarMenuButton
                    Icon={ScrollText}
                    text="Accounts"
                    route="/"
                    isActive={router.state.location.pathname === "/"}
                  />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              <div className="flex flex-col px-8 py-14 gap-9">
                <div className="flex gap-4">
                  <ActionButton icon={LogOut} onClick={onLogout}/>
                  <ActionButton variant='slate' icon={Lock} onClick={() => console.log("locking")}/>
                </div>
                <img className="w-[124px]" src={wakeUpPowered} />
              </div>
            </SidebarFooter>
          </Sidebar>
          <main className="flex flex-1 overflow-auto p-8 lg:p-16">
            <div className="w-full flex flex-col gap-4">
              <SidebarTrigger />
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </SuperChainAccountProvider>
  );
}