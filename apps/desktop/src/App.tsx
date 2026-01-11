import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

import reactLogo from "./assets/react.svg";
import "@/styles/global.css";

function App() {
  // const [greetMsg, setGreetMsg] = useState("");
  // const [name, setName] = useState("");

  // async function greet() {
  //   // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  //   setGreetMsg(await invoke("greet", { name }));
  // }

  return (
    <main className="container">
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="flex flex-row items-center gap-2">
          <img
            src={reactLogo}
            className="w-20 h-20 animate-spin-slow"
            alt="React logo"
          />
          <h1 className="text-4xl font-bold bg-amber-600">Welcome to Tauri!</h1>
        </div>
      </div>
    </main>
  );
}

export default App;
