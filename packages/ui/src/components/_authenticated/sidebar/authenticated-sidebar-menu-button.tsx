import React from "react";
import { LucideIcon } from "lucide-react";
import { SidebarMenuButton } from "@/components/ui/sidebar";

type AuthenticatedSidebarMenuButtonProps = {
    Icon: LucideIcon
    text: string
    route: string
    isActive?: boolean
};

export const AuthenticatedSidebarMenuButton: React.FC<AuthenticatedSidebarMenuButtonProps> = ({ Icon, text, route, isActive = false }) => {
  return (
    <SidebarMenuButton size='lg' isActive={isActive} asChild>
      <a href={route} className="font-medium text-custom-slate-400">
        <Icon size={24} strokeWidth={2} className="mr-4" />
        <span className="text-base">{text}</span>
      </a>
    </SidebarMenuButton>
  );
};