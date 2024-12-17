import React from "react";
import { LucideIcon } from "lucide-react";
import { SidebarMenuButton } from "@/components/ui/sidebar";

type AuthenticatedSidebarMenuButtonProps = {
    Icon: LucideIcon
    text: string
    route: string
};

export const AuthenticatedSidebarMenuButton: React.FC<AuthenticatedSidebarMenuButtonProps> = ({ Icon, text, route }) => {
  return (
    <SidebarMenuButton size='lg' asChild>
      <a href={route} className="font-medium text-custom-slate-400">
        <Icon size={24} strokeWidth={2} className="mr-4" />
        <span className="text-base">{text}</span>
      </a>
    </SidebarMenuButton>
  );
};