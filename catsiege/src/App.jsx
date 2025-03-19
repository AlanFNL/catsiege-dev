import { useEffect } from "react";
import { scroller } from "react-scroll";
import "./App.css";
import Hero from "./Hero";
import Whitelist from "./Whitelist";
import Fourth from "./Fourth";
import Footer from "./Footer";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Tournament from "./components/Tournament";
import Guess from "./components/Guess";
import TournamentWinners from "./components/TournamentWinners";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
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
import WelcomeGuide from "./components/WelcomeGuide";
import { ProtectedAdminRoute } from "./components/ProtectedAdminRoute";
import AdminDashboard from "./components/AdminDashboard";

// Create a wrapper component to access AuthContext
function AppContent() {
  const { user } = useAuth();

  useEffect(() => {
    // Get the current URL parameters
    const params = new URLSearchParams(window.location.search);
    const section = window.location.pathname.substring(1);

    // Check if there's a section to scroll to
    const targetSection = params.get("section") || section;

    if (targetSection) {
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
    <>
      <WelcomeGuide user={user} />
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <div className="overflow-x-hidden">
                <Nav />
                <Hero />
                <Guess />
                <div id="tournament">
                  <TournamentWinners />
                </div>
                <div id="roadmap">
                  <Whitelist />
                </div>

                <Fourth />
                <div id="contact">
                  <Footer />
                </div>
              </div>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

// Main App component with providers
function App() {
  return (
    <AuthProvider>
      <PointsProvider>
        <WalletContextProvider>
          <AppContent />
        </WalletContextProvider>
      </PointsProvider>
    </AuthProvider>
  );
}

export default App;
