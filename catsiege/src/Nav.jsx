import React, { useState, useEffect } from "react";
import { Menu, X, User, ChevronDown, Wallet, Gift, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-scroll";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { authService } from "./services/api";
import logo from "./assets/logo.png";
import points from "./assets/points.png";
import Rewards from "./components/Rewards";
import { WalletConnect } from "./components/WalletConnect";
import WalletModal from "./components/WalletModal";

const navItems = [
  { name: "TOURNAMENT", target: "tournament", isScroll: true },
  { name: "ROADMAP", target: "roadmap", isScroll: true },
  { name: "CONTACT", target: "contact", isScroll: true },
];

const navItemVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 * i },
  }),
};

const dropdownVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".user-dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleRewardsClick = () => {
    setIsDropdownOpen(false);
    setIsRewardsOpen(true);
  };

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-black/50 text-white backdrop-blur-sm p-4 lg:p-8 border-b border-[#FFF5E4]"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <RouterLink to="/">
          <img src={logo} alt="Logo" className="h-8 w-auto" />
        </RouterLink>

        <div className="hidden md:flex space-x-4 lg:space-x-8">
          {navItems.map((item, index) => (
            <motion.div
              key={item.name}
              variants={navItemVariants}
              initial="hidden"
              animate="visible"
              custom={index}
            >
              {item.isScroll ? (
                <Link
                  to={item.target}
                  smooth={true}
                  duration={500}
                  className="text-sm lg:text-base hover:text-gray-300 cursor-pointer"
                >
                  {item.name}
                </Link>
              ) : (
                <RouterLink
                  to={item.target}
                  className="text-sm lg:text-base hover:text-gray-300 cursor-pointer"
                >
                  {item.name}
                </RouterLink>
              )}
            </motion.div>
          ))}

          {user ? (
            <div className="relative flex items-center gap-6 -mt-1">
              <div className="flex items-center gap-2">
                <img src={points} />
                <span className="text-2xl text-[#FFF5E4]/70">
                  {user.points || 0}
                </span>
              </div>
              <motion.button
                className="flex items-center space-x-2 text-sm lg:text-base hover:text-gray-300"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <User size={20} />

                <ChevronDown size={16} />
              </motion.button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    className="absolute right-0 mt-48 w-64 bg-black border border-[#FFF5E4] rounded-lg shadow-lg py-1 overflow-x-hidden"
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <span className="p-4 overflow-scroll">{user.email}</span>
                    <button
                      onClick={handleRewardsClick}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm hover:bg-[#FFF5E4]/10"
                    >
                      <Gift size={16} />
                      <span>Points & Rewards</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsWalletOpen(true);
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm hover:bg-[#FFF5E4]/10"
                    >
                      <Wallet size={16} />
                      <span>Connect Wallet</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm hover:bg-[#FFF5E4]/10 text-red-400"
                    >
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <RouterLink
                to="/login"
                className="text-sm lg:text-base hover:text-gray-300 cursor-pointer"
              >
                SIGN IN
              </RouterLink>
              <RouterLink
                to="/register"
                className="text-sm lg:text-base hover:text-gray-300 cursor-pointer"
              >
                SIGN UP
              </RouterLink>
            </>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="mt-4 flex flex-col space-y-2 md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {navItems.map((item) => (
              <RouterLink
                key={item.name}
                to={item.target}
                className="block py-2 text-sm hover:text-gray-300"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </RouterLink>
            ))}
            {user ? (
              <>
                <RouterLink
                  to="/rewards"
                  className="block py-2 text-sm hover:text-gray-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Points & Rewards ({user.points || 0})
                </RouterLink>
                <RouterLink
                  to="/wallet"
                  className="block py-2 text-sm hover:text-gray-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Connect Wallet
                </RouterLink>
                <button
                  onClick={handleLogout}
                  className="block py-2 text-sm hover:text-gray-300 text-red-400 text-left w-full"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <RouterLink
                  to="/login"
                  className="block py-2 text-sm hover:text-gray-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  SIGN IN
                </RouterLink>
                <RouterLink
                  to="/register"
                  className="block py-2 text-sm hover:text-gray-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  SIGN UP
                </RouterLink>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Rewards isOpen={isRewardsOpen} onClose={() => setIsRewardsOpen(false)} />
      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
      />
    </motion.nav>
  );
}
