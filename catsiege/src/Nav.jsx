import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  User,
  ChevronDown,
  Wallet,
  Gift,
  LogOut,
  BarChart3,
  BadgeHelp,
  Info,
  Gamepad2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-scroll";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { authService } from "./services/api";
import logo from "./assets/logo.png";
import points from "./assets/points.png";
import Rewards from "./components/Rewards";
import { WalletConnect } from "./components/WalletConnect";
import WalletModal from "./components/WalletModal";
import discordLogo from "./assets/discord-logo.svg";
import twitter from "./assets/twitter.svg";
import ig from "./assets/ig.svg";
import discord from "./assets/discord1.svg";
import ReactDOM from "react-dom";

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

const AuthSkeleton = () => (
  <div className="hidden md:flex items-center gap-4">
    <div className="h-4 w-16 bg-[#FFF5E4]/10 animate-pulse rounded"></div>
    <div className="h-4 w-16 bg-[#FFF5E4]/10 animate-pulse rounded"></div>
  </div>
);

// Discord Support Popup Component
const DiscordSupportPopup = ({ isOpen, onClose }) => {
  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/80 z-[999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 z-[1000] overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="min-h-screen px-4 text-center">
              <span
                className="inline-block h-screen align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>

              <motion.div
                className="inline-block w-full max-w-md my-8 text-left align-middle transition-all transform bg-black shadow-xl rounded-2xl border border-[#FFF5E4]/20"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative p-6">
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-[#FFF5E4]/60 hover:text-[#FFF5E4]"
                  >
                    <X size={24} />
                  </button>

                  <div className="mb-6">
                    <h1 className="text-2xl text-center font-bold text-[#FFF5E4]">
                      Join Our Community
                    </h1>
                    <p className="text-[#FFF5E4]/60 text-center mt-2">
                      Get help, share feedback, and join our growing community
                    </p>
                  </div>

                  <div className="flex items-center justify-center mb-6">
                    <div className="w-24 h-24 bg-[#FFF5E4]/10 rounded-full flex items-center justify-center p-4">
                      <img
                        src={discordLogo}
                        alt="Discord"
                        className="w-16 h-16"
                      />
                    </div>
                  </div>

                  <div className="bg-[#FFF5E4]/5 rounded-lg p-4 mb-6 text-center">
                    <p className="text-[#FFF5E4]/80 mb-2">
                      Join our Discord server for exclusive updates, community
                      events, and support
                    </p>
                    <p className="text-[#FFF5E4]/60 text-sm">
                      https://discord.gg/jTfQ42YKbq
                    </p>
                  </div>

                  <a
                    href="https://discord.gg/jTfQ42YKbq"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gradient-to-r from-[#FFF5E4]/20 to-[#FFF5E4]/10 hover:from-[#FFF5E4]/30 hover:to-[#FFF5E4]/20 
                    text-[#FFF5E4] py-3 px-4 rounded-lg font-medium text-center border border-[#FFF5E4]/20 transition-all"
                  >
                    Join Discord Server
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

// Info Modal Component
const InfoModal = ({ isOpen, onClose }) => {
  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/80 z-[999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 z-[1000] overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="min-h-screen px-4 text-center">
              <span
                className="inline-block h-screen align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>

              <motion.div
                className="inline-block w-full max-w-md my-8 text-left align-middle transition-all transform bg-black shadow-xl rounded-2xl border border-[#FFF5E4]/20"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative p-6">
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-[#FFF5E4]/60 hover:text-[#FFF5E4]"
                  >
                    <X size={24} />
                  </button>

                  <div className="mb-6">
                    <h1 className="text-2xl text-center font-bold text-[#FFF5E4]">
                      About CatSiege
                    </h1>
                    <p className="text-[#FFF5E4]/60 text-center mt-2">
                      Stay tuned for the latest updates and information
                    </p>
                  </div>

                  <div className="bg-[#FFF5E4]/5 rounded-lg p-4 mb-6">
                    <h2 className="text-xl text-[#FFF5E4] mb-2">
                      Connect with us
                    </h2>
                    <div className="flex items-center space-x-4 mt-4">
                      <a
                        href="https://discord.gg/jTfQ42YKbq"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[#FFF5E4]/80 hover:text-[#FFF5E4] transition-colors"
                      >
                        <img src={discord} alt="Discord" className="h-5 w-5" />
                        <span className="hidden sm:inline">Discord</span>
                      </a>
                      <a
                        href="https://instagram.com/catsiege"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[#FFF5E4]/80 hover:text-[#FFF5E4] transition-colors"
                      >
                        <img src={ig} alt="Instagram" className="h-5 w-5" />
                        <span className="hidden sm:inline">Instagram</span>
                      </a>
                      <a
                        href="https://x.com/catsiege"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[#FFF5E4]/80 hover:text-[#FFF5E4] transition-colors"
                      >
                        <img src={twitter} alt="Twitter" className="h-5 w-5" />
                        <span className="hidden sm:inline">Twitter</span>
                      </a>
                    </div>
                  </div>

                  <div className="bg-[#FFF5E4]/5 rounded-lg p-4 mb-6">
                    <h2 className="text-xl text-[#FFF5E4] mb-2">
                      Purchase NFT
                    </h2>
                    <p className="text-[#FFF5E4]/70 mb-4">
                      Become a part of the CatSiege community by owning your
                      very own NFT
                    </p>
                    <a
                      href="https://magiceden.io/marketplace/catsiege_zero"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-gradient-to-r from-[#FFF5E4]/20 to-[#FFF5E4]/10 hover:from-[#FFF5E4]/30 hover:to-[#FFF5E4]/20 
                      text-[#FFF5E4] py-3 px-4 rounded-lg font-medium text-center border border-[#FFF5E4]/20 transition-all"
                    >
                      View on Magic Eden
                    </a>
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-[#FFF5E4]/70">
                      Questions or feedback? Contact us at:
                    </p>
                    <a
                      href="mailto:team@catsiege.com"
                      className="text-[#FFF5E4] hover:underline"
                    >
                      team@catsiege.com
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGamesDropdownOpen, setIsGamesDropdownOpen] = useState(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isDiscordOpen, setIsDiscordOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const gamesDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".user-dropdown")) {
        setIsDropdownOpen(false);
      }
      if (isGamesDropdownOpen && !event.target.closest(".games-dropdown")) {
        setIsGamesDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen, isGamesDropdownOpen]);

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
    <>
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

            {/* Games Dropdown Menu */}
            <motion.div
              variants={navItemVariants}
              initial="hidden"
              animate="visible"
              custom={navItems.length}
              className="games-dropdown relative"
              ref={gamesDropdownRef}
            >
              <button
                onClick={() => setIsGamesDropdownOpen(!isGamesDropdownOpen)}
                className="flex items-center text-sm lg:text-base hover:text-gray-300 cursor-pointer gap-1"
              >
                <Gamepad2 size={18} className="mr-1" />
                GAMES
                <ChevronDown size={16} />
              </button>

              <AnimatePresence>
                {isGamesDropdownOpen && (
                  <motion.div
                    className="absolute left-0 mt-2 w-48 bg-black border border-[#FFF5E4] rounded-lg shadow-lg py-1 z-50"
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <RouterLink
                      to="/games/guess"
                      onClick={() => setIsGamesDropdownOpen(false)}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm hover:bg-[#FFF5E4]/10"
                    >
                      <span>Guess the Number</span>
                    </RouterLink>
                    <RouterLink
                      to="/games/battle"
                      onClick={() => setIsGamesDropdownOpen(false)}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm hover:bg-[#FFF5E4]/10"
                    >
                      <span>Sit & Go Battle</span>
                    </RouterLink>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Social Media Icons */}
            <div className="hidden md:flex items-center space-x-4 ml-2 border-l border-[#FFF5E4]/30 pl-4">
              <a
                href="https://discord.gg/jTfQ42YKbq"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
                tabIndex="0"
                className="hover:opacity-80 transition-opacity"
              >
                <img src={discord} alt="Discord" className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/catsiege"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                tabIndex="0"
                className="hover:opacity-80 transition-opacity"
              >
                <img src={ig} alt="Instagram" className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/catsiege"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                tabIndex="0"
                className="hover:opacity-80 transition-opacity"
              >
                <img src={twitter} alt="Twitter" className="h-5 w-5" />
              </a>
            </div>

            {loading ? (
              <AuthSkeleton />
            ) : user ? (
              <div className="relative flex items-center gap-6 -mt-1">
                <div className="flex items-center gap-2">
                  <img src={points} alt="Points" />
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
                      className="absolute right-0 mt-64 w-64 bg-black border border-[#FFF5E4] rounded-lg shadow-lg py-1 overflow-x-hidden"
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
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsDiscordOpen(true);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm hover:bg-[#FFF5E4]/10"
                      >
                        <BadgeHelp size={16} />
                        <span>Support & Community</span>
                      </button>
                      {user.isAdmin && (
                        <RouterLink
                          to="/admin/dashboard"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm hover:bg-[#FFF5E4]/10"
                        >
                          <BarChart3 size={16} />
                          <span>Admin Dashboard</span>
                        </RouterLink>
                      )}
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
              <div className="hidden md:flex space-x-4 lg:space-x-8">
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
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center md:hidden">
            {/* Mobile Social Icons */}
            <div className="flex items-center space-x-3 mr-4">
              <a
                href="https://discord.gg/jTfQ42YKbq"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
                tabIndex="0"
                className="hover:opacity-80 transition-opacity"
              >
                <img src={discord} alt="Discord" className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/catsiege"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                tabIndex="0"
                className="hover:opacity-80 transition-opacity"
              >
                <img src={ig} alt="Instagram" className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/catsiege"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                tabIndex="0"
                className="hover:opacity-80 transition-opacity"
              >
                <img src={twitter} alt="Twitter" className="h-5 w-5" />
              </a>
            </div>

            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
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
              {navItems.map((item) =>
                item.isScroll ? (
                  <Link
                    key={item.name}
                    to={item.target}
                    smooth={true}
                    duration={500}
                    className="block py-2 text-sm hover:text-gray-300 cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <RouterLink
                    key={item.name}
                    to={item.target}
                    className="block py-2 text-sm hover:text-gray-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </RouterLink>
                )
              )}

              {/* Mobile Games Menu */}
              <div className="py-2">
                <button
                  onClick={() => setIsGamesDropdownOpen(!isGamesDropdownOpen)}
                  className="flex items-center text-sm hover:text-gray-300 gap-2 w-full"
                >
                  <Gamepad2 size={18} />
                  GAMES
                  <ChevronDown
                    size={16}
                    className={
                      isGamesDropdownOpen ? "transform rotate-180" : ""
                    }
                  />
                </button>

                <AnimatePresence>
                  {isGamesDropdownOpen && (
                    <motion.div
                      className="pl-6 mt-2 flex flex-col space-y-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <RouterLink
                        to="/games/guess"
                        className="block py-1 text-sm hover:text-gray-300"
                        onClick={() => {
                          setIsGamesDropdownOpen(false);
                          setIsMenuOpen(false);
                        }}
                      >
                        Guess the Number
                      </RouterLink>
                      <RouterLink
                        to="/games/battle"
                        className="block py-1 text-sm hover:text-gray-300"
                        onClick={() => {
                          setIsGamesDropdownOpen(false);
                          setIsMenuOpen(false);
                        }}
                      >
                        Sit & Go Battle
                      </RouterLink>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {loading ? (
                <div className="py-2">
                  <div className="h-4 w-20 bg-[#FFF5E4]/10 animate-pulse rounded mb-2"></div>
                  <div className="h-4 w-20 bg-[#FFF5E4]/10 animate-pulse rounded"></div>
                </div>
              ) : user ? (
                <>
                  <RouterLink
                    className="block py-2 text-sm hover:text-gray-300"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleRewardsClick();
                    }}
                  >
                    Points & Rewards ({user.points || 0})
                  </RouterLink>
                  <RouterLink
                    className="block py-2 text-sm hover:text-gray-300"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsWalletOpen(true);
                    }}
                  >
                    Connect Wallet
                  </RouterLink>
                  <RouterLink
                    className="block py-2 text-sm hover:text-gray-300"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsDiscordOpen(true);
                    }}
                  >
                    Support & Community
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
                  <RouterLink
                    className="block py-2 text-sm hover:text-gray-300"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsDiscordOpen(true);
                    }}
                  >
                    Support & Community
                  </RouterLink>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Info button in bottom right corner */}
      <motion.button
        onClick={() => setIsInfoModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-black/70 backdrop-blur-sm text-[#FFF5E4] rounded-full p-3 shadow-lg border border-[#FFF5E4]/30"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <Info size={24} />
      </motion.button>

      {/* Modals */}
      {isDiscordOpen && (
        <DiscordSupportPopup
          isOpen={isDiscordOpen}
          onClose={() => setIsDiscordOpen(false)}
        />
      )}

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />

      {isRewardsOpen && (
        <Rewards
          isOpen={isRewardsOpen}
          onClose={() => setIsRewardsOpen(false)}
        />
      )}

      {isWalletOpen && (
        <WalletModal
          isOpen={isWalletOpen}
          onClose={() => setIsWalletOpen(false)}
        />
      )}
    </>
  );
}
