import "react";

import "./App.css";
import Hero from "./Hero";
import Second from "./Second";
import Whitelist from "./Whitelist";
import Fourth from "./Fourth";
import Footer from "./Footer";

function App() {
  return (
    <div className="overflow-x-hidden">
      <Hero />
      <div id="tournament">
        <Second />
      </div>
      <div id="whitelist">
        <Whitelist />
      </div>

      <Fourth />
      <div id="contact">
        <Footer />
      </div>
    </div>
  );
}

export default App;
