import "@/styles/global.css";

import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { Toaster } from "sonner";

import MainLayout from "@/components/layout/main-layout";
import { ROUTES } from "@/helpers/navigation/navigation";
import { useServerLogs } from "@/hooks/use-server-logs";
import { useServerPolling } from "@/hooks/use-server-polling";
import { Home } from "@/pages/home";
import { Setting } from "@/pages/settings";
import { SuiteDetail } from "@/pages/suite-detail";

const ROUTER = createBrowserRouter([
  {
    path: ROUTES.HOME,
    Component: MainLayout,
    children: [
      { index: true, element: <Home /> },
      { path: ROUTES.SUITE, element: <SuiteDetail /> },
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

  return (
    <>
      <RouterProvider router={ROUTER} />
      <Toaster richColors position="bottom-right" />
    </>
  );
}

export default App;
