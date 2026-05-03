import "@/styles/global.css";

import { useEffect } from "react";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { Toaster } from "sonner";

import { useProjectStore } from "@/stores/project-store";
import { useServerStore } from "@/stores/server-store";

import MainLayout from "@/components/layout/main-layout";
import { ROUTES } from "@/helpers/navigation/navigation";
import { useServerLogs } from "@/hooks/use-server-logs";
import { useServerPolling } from "@/hooks/use-server-polling";
import { Home } from "@/pages/home";
import { RouteDetail } from "@/pages/route-detail";
import { RoutesListPage } from "@/pages/routes-list";
import { Setting } from "@/pages/settings";
import { SuiteDetail } from "@/pages/suite-detail";

const ROUTER = createBrowserRouter([
  {
    path: ROUTES.HOME,
    Component: MainLayout,
    children: [
      { index: true, element: <Home /> },
      { path: ROUTES.SUITE, element: <SuiteDetail /> },
      { path: ROUTES.ROUTE, element: <RouteDetail /> },
      { path: ROUTES.ROUTES_LIST, element: <RoutesListPage /> },
      { path: ROUTES.SETTINGS, element: <Setting /> },
    ],
  },
]);

/**
 * Root application component.
 * Mounts app-level hooks for server polling and log streaming,
 * then renders the router.
 */
function App() {
  useServerPolling();
  useServerLogs();

  const activeProject = useProjectStore(
    (s) => s.projects.find((p) => p.id === s.activeProjectId) ?? null,
  );
  const config = useServerStore((s) => s.config);
  const loadConfig = useServerStore((s) => s.loadConfig);

  useEffect(() => {
    if (activeProject?.path && !config) {
      void loadConfig(activeProject.path);
    }
  }, [activeProject?.path, config, loadConfig]);

  return (
    <>
      <RouterProvider router={ROUTER} />
      <Toaster richColors position="bottom-right" />
    </>
  );
}

export default App;
