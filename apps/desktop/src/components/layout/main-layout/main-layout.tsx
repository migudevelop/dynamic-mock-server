import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Outlet } from "react-router";

import Header from "@/components/layout/header";
import AppSidebar from "@/components/layout/sidebar";
import ConsolePanel from "@/components/server/console-panel";
import { Button } from "@/components/shadcn/ui/button";
import { SidebarProvider } from "@/components/shadcn/ui/sidebar";

/** Height of the expanded console panel in Tailwind units */
const CONSOLE_HEIGHT = "h-48";

/**
 * Root layout for all pages. Wraps content in a sidebar + header shell and
 * renders a collapsible server log panel at the bottom.
 */
export function MainLayout() {
  const [consolOpen, setConsolOpen] = useState(false);

  return (
    <SidebarProvider className="bg-sidebar">
      <AppSidebar />
      <div className="h-svh overflow-hidden lg:p-2 w-full">
        <div className="lg:border lg:rounded-md overflow-hidden flex flex-col items-center justify-start bg-container h-full w-full bg-background">
          <Header />
          <main className="flex-1 overflow-auto p-8 bg-background w-full">
            <Outlet />
          </main>

          {/* Console toggle bar */}
          <div className="w-full border-t bg-muted/20 shrink-0">
            <div className="flex items-center justify-between px-4 py-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Server Logs
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                onClick={() => setConsolOpen((prev) => !prev)}
                aria-label={consolOpen ? "Collapse logs" : "Expand logs"}
              >
                {consolOpen ? (
                  <ChevronDown className="size-3" />
                ) : (
                  <ChevronUp className="size-3" />
                )}
              </Button>
            </div>
            {consolOpen && (
              <div className={`${CONSOLE_HEIGHT} w-full`}>
                <ConsolePanel />
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
