import { Outlet } from "react-router";

import Header from "@/components/layout/header";
import AppSidebar from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/shadcn/ui/sidebar";

export function MainLayout() {
  return (
    <SidebarProvider className="bg-sidebar">
      <AppSidebar />
      <div className="h-svh overflow-hidden lg:p-2 w-full">
        <div className="lg:border lg:rounded-md overflow-hidden flex flex-col items-center justify-start bg-container h-full w-full bg-background">
          <Header />
          <main className="flex-1 overflow-auto p-8 bg-background w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
