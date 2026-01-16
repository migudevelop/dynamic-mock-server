import { Layers, Settings, Copyright, SquareTerminal } from "lucide-react";
import type { ComponentProps } from "react";
import { useLocation } from "react-router";

import type { AppSidebarItemProps } from "./app-sidebar-item";
import { AppSidebarItem } from "./app-sidebar-item";

import { Separator } from "@/components/shadcn/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/shadcn/ui/sidebar";
import { ROUTES, isRouteActive } from "@/helpers/navigation/navigation";

const MENU_ITEMS: AppSidebarItemProps[] = [
  {
    title: "Suites",
    icon: Layers,
    href: ROUTES.HOME,
  },
  {
    title: "Settings",
    icon: Settings,
    href: ROUTES.SETTINGS,
  },
];

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation();
  return (
    <Sidebar collapsible="offcanvas" className="lg:border-r-0!" {...props}>
      <SidebarHeader className="p-3 sm:p-4 lg:p-5 ">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3">
              <div className="bg-primary rounded-lg p-2 text-white">
                <SquareTerminal className="size-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold leading-tight">
                  Dynamic Mock Server
                </h1>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                  v1.0.0
                </p>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-3 sm:px-4 lg:px-5">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {MENU_ITEMS.map(({ href, icon, title }) => {
                const isActive = isRouteActive(pathname, href);
                return (
                  <AppSidebarItem
                    key={title}
                    href={href}
                    icon={icon}
                    title={title}
                    isActive={isActive}
                  />
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <Separator />
      <SidebarFooter className="px-3 sm:px-4 lg:px-5 pb-3 sm:pb-4 lg:pb-5">
        <span className="w-full mt-4 flex items-center gap-2 justify-center text-xs text-muted-foreground">
          <Copyright className="size-4" />
          Migudevelop
        </span>
      </SidebarFooter>
    </Sidebar>
  );
}
