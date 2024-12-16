import { createFileRoute, Outlet, redirect} from "@tanstack/react-router";
import { z } from "zod";
import { LogOut, Settings, User, ScrollText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import optimismLogo from "@/assets/logos/optimism-logo.svg";
import { AuthenticatedSidebarMenuButton } from "@/components/_authenticated/sidebar";

const authenticatedSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated")({
  validateSearch: authenticatedSearchSchema,
  // beforeLoad: async ({ context,location }) => {
  //   if (!context.isLoggedIn) {
  //     throw redirect({
  //       to: "/login",
  //       search: {
  //       // Use the current location to power a redirect after login
  //       // (Do not use `router.state.resolvedLocation` as it can
  //       // potentially lag behind the actual current location)
  //         redirect: location.href,
  //       },
  //     });
  //   }
  // },
  component: AuthenticatedLayout
});

function AuthenticatedLayout() {
  return (
    <SidebarProvider>
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
                <AuthenticatedSidebarMenuButton
                  Icon={User}
                  text="Profile"
                  route="/profile"
                />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <AuthenticatedSidebarMenuButton
                  Icon={ScrollText}
                  text="Accounts"
                  route="/accounts"
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex justify-between px-2 pb-4">
              <Button variant="outline" size="icon" className="h-10 w-10">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1 bg-inherit">
          <header className="flex h-14 items-center border-b px-4">
            <SidebarTrigger />
          </header>
          <main className="overflow-auto p-4"><Outlet /></main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}