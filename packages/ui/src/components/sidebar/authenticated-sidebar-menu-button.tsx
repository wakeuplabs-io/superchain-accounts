import React from "react";
import { LucideIcon } from "lucide-react";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

type AuthenticatedSidebarMenuButtonProps = {
  Icon: LucideIcon;
  text: string;
  route: string;
  isActive?: boolean;
};

export const AuthenticatedSidebarMenuButton: React.FC<
  AuthenticatedSidebarMenuButtonProps
> = ({ Icon, text, route, isActive = false }) => {
  return (
    <SidebarMenuButton size="lg" isActive={isActive} className="h-10" asChild>
      <Link to={route} className="group">
        <Icon
          size={20}
          strokeWidth={2}
          className={cn("mr-2", isActive && "text-primary")}
        />
        <span>{text}</span>
      </Link>
    </SidebarMenuButton>
  );
};
