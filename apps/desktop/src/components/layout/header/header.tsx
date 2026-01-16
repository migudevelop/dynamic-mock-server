import { SidebarTrigger } from "@/components/shadcn/ui/sidebar";

export function Header() {
  return (
    <header className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 border-b bg-card sticky top-0 z-10 w-full">
      <SidebarTrigger className="-ml-1 sm:-ml-2" />
      <h1 className="text-base sm:text-lg font-medium flex-1 truncate">
        Dynamic Mock Server
      </h1>
    </header>
  );
}
