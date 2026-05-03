import ProjectSelector from "@/components/project/project-selector";
import ServerControlBar from "@/components/server/server-control-bar";
import { SidebarTrigger } from "@/components/shadcn/ui/sidebar";

/**
 * Sticky application header.
 * Contains the sidebar trigger, project selector dropdown, and server control bar.
 */
export function Header() {
  return (
    <header className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 border-b bg-card sticky top-0 z-10 w-full">
      <SidebarTrigger className="-ml-1 sm:-ml-2" />
      <ProjectSelector />
      <div className="ml-auto">
        <ServerControlBar />
      </div>
    </header>
  );
}
