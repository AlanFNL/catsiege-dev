import { useState } from "react";

import "./App.css";
import Hero from "./Hero";
import Second from "./Second";
import Whitelist from "./Whitelist";
import Fourth from "./Fourth";
import Footer from "./Footer";

function App() {
  return (
    <body>
      <Hero />
      <Second />
      <Whitelist />
      <Fourth />
      <Footer />
    </body>
  );
}

export default App;
