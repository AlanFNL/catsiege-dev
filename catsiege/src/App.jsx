import { useEffect } from "react";
import { scroller } from "react-scroll";
import "./App.css";
import Hero from "./Hero";
import Whitelist from "./Whitelist";
import Fourth from "./Fourth";
import Footer from "./Footer";
import { AuthProvider } from "./contexts/AuthContext";
import Tournament from "./components/Tournament";
import Guess from "./components/Guess";
import TournamentWinners from "./components/TournamentWinners";
import Login from "./pages/Login";
import Register from "./pages/Register";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import Nav from "./Nav";
import { PointsProvider } from "./contexts/PointsContext";
import { WalletContextProvider } from "./contexts/WalletContext";

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
    <AuthProvider>
      <PointsProvider>
        <WalletContextProvider>
          <Router>
            <Routes>
              <Route
                path="/"
                element={
                  <div className="overflow-x-hidden">
                    <Nav />
                    <Hero />
                    <div id="tournament">
                      <TournamentWinners />
                    </div>
                    <div id="roadmap">
                      <Whitelist />
                    </div>
                    <Guess />

                    <Fourth />
                    <div id="contact">
                      <Footer />
                    </div>
                  </div>
                }
              />

              <Route path="/login" element={<Login />} />

              <Route path="/register" element={<Register />} />
            </Routes>
          </Router>
        </WalletContextProvider>
      </PointsProvider>
    </AuthProvider>
  );
}

export default App;
