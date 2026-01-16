import "@/styles/global.css";

import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

import MainLayout from "@/components/layout/main-layout";
import { ROUTES } from "@/helpers/navigation/navigation";
import { Home } from "@/pages/home";
import { Setting } from "@/pages/settings";

const ROUTER = createBrowserRouter([
  {
    path: ROUTES.HOME,
    Component: MainLayout,
    children: [
      { index: true, element: <Home /> },
      { path: ROUTES.SETTINGS, element: <Setting /> },
    ],
  },
]);

function App() {
  // const [greetMsg, setGreetMsg] = useState("");
  // const [name, setName] = useState("");

  // async function greet() {
  //   // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  //   setGreetMsg(await invoke("greet", { name }));
  // }

  return <RouterProvider router={ROUTER} />;
}

export default App;
