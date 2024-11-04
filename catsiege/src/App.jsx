import { useEffect } from "react";
import { scroller } from "react-scroll";
import "./App.css";
import Hero from "./Hero";
import Second from "./Second";
import Whitelist from "./Whitelist";
import Fourth from "./Fourth";
import Footer from "./Footer";
import Tournament from "./components/Tournament";

function App() {
  useEffect(() => {
    // Get the current URL parameters
    const params = new URLSearchParams(window.location.search);
    const section = window.location.pathname.substring(1); // Remove the leading slash

    // Check if there's a section to scroll to (either from query params or pathname)
    const targetSection = params.get("section") || section;

    if (targetSection) {
      // Add a small delay to ensure components are mounted
      setTimeout(() => {
        scroller.scrollTo(targetSection, {
          duration: 800,
          delay: 0,
          smooth: "easeInOutQuart",
        });
      }, 100);
    }
  }, []);

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
