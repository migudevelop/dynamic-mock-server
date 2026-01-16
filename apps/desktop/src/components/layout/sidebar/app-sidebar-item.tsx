import { ChevronRight } from "lucide-react";
import type { ComponentType } from "react";
import { Link } from "react-router";

import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/shadcn/ui/sidebar";

export interface AppSidebarItemProps {
  title: string;
  icon: ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  isActive?: boolean;
}

export function AppSidebarItem({
  title,
  icon: Icon,
  href,
  isActive,
}: AppSidebarItemProps) {
  return (
    <SidebarMenuItem key={title}>
      <SidebarMenuButton asChild isActive={isActive} className="h-9 sm:h-9.5">
        <Link to={href}>
          <Icon className={`size-4 sm:size-5`} />
          <span className={`text-sm`}>{title}</span>
          {isActive && (
            <ChevronRight className="ml-auto size-4 text-muted-foreground opacity-60" />
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
