/// <reference types="chrome" />
/// <reference types="vite-plugin-svgr/client" />

import Logo from "./Logo";
import "./App.css";
import { useEffect } from "react";
import { Visu } from "./Visu/Visu";

function App() {
  return (
    <div className="App">
      <Visu />
    </div>
  );
}

export default App;
