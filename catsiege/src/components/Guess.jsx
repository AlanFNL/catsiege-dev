import React, { useState, useRef } from "react";
import orb from "../assets/guess-start4.png";
import GuessingGame from "./GuessGame";

import example from "../assets/screen.webp";
import { motion, AnimatePresence } from "framer-motion";

import bgMusic from "../assets/guess-game-music.mp3";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/api";

const tabContentVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.3 } },
};

const mainContentVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
};

function Guess() {
  const [activeTab, setActiveTab] = useState("");
  const audioRef = useRef(new Audio(bgMusic));
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { user, setUser } = useAuth();
  const [activeRuleTab, setActiveRuleTab] = useState("objective");
  const [isStartLoading, setIsStartLoading] = useState(false);

  audioRef.current.volume = 0.2;
  audioRef.current.loop = true;

  const setRules = () => {
    setActiveTab("rules");
  };

  const backFromRules = () => {
    setActiveTab("");
  };

  const startGame = () => {
    setActiveTab("game");
    audioRef.current.play().catch((error) => {
      console.log("Audio playback failed:", error);
    });
  };

  const handleBackToMenu = () => {
    setActiveTab("");
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  const handleStartGameConfirm = async () => {
    try {
      setIsStartLoading(true);
      // Deduct 5 points via API
      const response = await authService.updatePoints(-5);

      // Update user points in context
      setUser((prev) => ({
        ...prev,
        points: response.points,
      }));

      // Start the game
      setShowConfirmation(false);
      setActiveTab("game");
      audioRef.current.play().catch((error) => {
        console.log("Audio playback failed:", error);
      });
    } catch (error) {
      console.error("Failed to start game:", error);
    } finally {
      setIsStartLoading(false);
    }
  };

  React.useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  return (
    <section className="relative w-screen h-screen bg-[url('./assets/BG.webp')] bg-center flex justify-center items-center">
      <AnimatePresence mode="wait">
        {activeTab === "" && (
          <motion.div
            key="main-menu"
            variants={mainContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-[90vw] sm:w-[600px] flex flex-col items-center h-[80vh] bg-black/50 backdrop-blur-sm rounded-xl border border-[#FFF5E4]/20 p-8"
          >
            <h1 className="mt-[18%] text-2xl text-center font-bold z-10 text-[#FFF5E4]">
              The haunted number
            </h1>

            <div className="w-[500px] h-[80vh] md:h-[600px] flex flex-col gap-7 justify-center text-center items-center px-6">
              <motion.button
                onClick={() => setShowConfirmation(true)}
                className="z-10 text-center font-bold text-3xl h-16 w-[350px] rounded-lg bg-black/60 border border-[#FFF5E4]/20 backdrop-blur-sm text-[#FFF5E4] hover:bg-[#FFF5E4]/10 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                START
              </motion.button>

              <motion.button
                onClick={setRules}
                className="z-10 text-center font-bold text-3xl h-16 w-[350px] rounded-lg bg-black/60 border border-[#FFF5E4]/20 backdrop-blur-sm text-[#FFF5E4] hover:bg-[#FFF5E4]/10 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                RULES
              </motion.button>
            </div>
          </motion.div>
        )}

        {activeTab === "rules" && (
          <motion.div
            key="rules"
            variants={mainContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex justify-center flex-col items-center"
          >
            <div className="relative w-[90vw] sm:w-[600px] h-[80vh] bg-black/50 backdrop-blur-sm rounded-xl border border-[#FFF5E4]/20 p-8">
              <div className="flex flex-col items-center  h-[85%]">
                <h1 className="text-3xl font-bold text-[#FFF5E4] mb-8">
                  RULES
                </h1>

                <div className="flex gap-4 mb-8">
                  {["objective", "multiplier", "victory"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveRuleTab(tab)}
                      className={`px-4 py-2 rounded-lg ${
                        activeRuleTab === tab
                          ? "bg-[#FFF5E4]/20 text-[#FFF5E4]"
                          : "text-[#FFF5E4]/60 hover:text-[#FFF5E4]"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {activeRuleTab === "objective" && (
                    <motion.div
                      key="objective"
                      variants={tabContentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="text-[#FFF5E4]/80 max-w-md"
                    >
                      <div className="space-y-4">
                        <p className="italic text-lg text-center">
                          The darkness whispers you challenge, a secret number
                          hides in the shadows.
                        </p>

                        <p className="text-lg bold text-center">
                          Uncover the hidden number in the selected range before
                          your opponent.
                        </p>
                        <img src={example} className="rounded" />
                      </div>
                    </motion.div>
                  )}

                  {activeRuleTab === "multiplier" && (
                    <motion.div
                      key="multiplier"
                      variants={tabContentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="text-[#FFF5E4]/80 max-w-md"
                    >
                      <div className="flex items-center gap-2 text-center justify-center">
                        <span className="font-bold text-2xl ">
                          Multiplier of Shadows:
                        </span>
                        <img src={orb} className="h-8" />
                        <span className="font-bold text-2xl">X1.7</span>
                      </div>
                      <p className="text-lg mt-8 text-center">
                        Each wrong guess weakens the Multiplier.
                      </p>
                      <p className="text-lg mt-4 text-center">
                        The higher the Multiplier when you guess correctly, the
                        higher your reward.
                      </p>
                    </motion.div>
                  )}

                  {activeRuleTab === "victory" && (
                    <motion.div
                      key="victory"
                      variants={tabContentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="text-[#FFF5E4]/80 max-w-md"
                    >
                      <div className="space-y-4">
                        <p className="text-center text-xl">
                          The first to guess correctly wins. Your reward depends
                          on your Multiplier and remaining attempts.
                        </p>
                        <p className="italic text-center text-lg mt-4">
                          Will you uncover the secret number before the darkness
                          takes over?
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center justify-center mt-16">
                <motion.button
                  onClick={backFromRules}
                  className=" px-8 py-2 rounded-lg bg-[#FFF5E4]/10 hover:bg-[#FFF5E4]/20 text-[#FFF5E4] transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Back
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeTab == "game" && <GuessingGame onBackToMenu={handleBackToMenu} />}

      {/* Enhanced Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/80 z-[1000] flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-black/90 p-8 rounded-xl border border-[#FFF5E4]/20 max-w-md w-full mx-4"
          >
            <h2 className="text-2xl text-center font-bold text-[#FFF5E4] mb-4">
              Start Game?
            </h2>

            <div className="bg-[#FFF5E4]/5 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#FFF5E4]/70">Current Balance:</span>
                <span className="text-[#FFF5E4] font-bold text-lg">
                  {user?.points || 0} points
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#FFF5E4]/70">Game Cost:</span>
                <span className="text-red-400 font-bold text-lg">
                  -5 points
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-[#FFF5E4]/10">
                <div className="flex justify-between items-center">
                  <span className="text-[#FFF5E4]/70">Balance After:</span>
                  <span className="text-[#FFF5E4] font-bold text-lg">
                    {(user?.points || 0) - 5} points
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-evenly">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 font-bold text-[#FFF5E4]/60 hover:text-[#FFF5E4]"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartGameConfirm}
                disabled={!user || user.points < 5 || isStartLoading}
                className="px-6 py-2 font-bold bg-[#FFF5E4]/10 hover:bg-[#FFF5E4]/20 text-[#FFF5E4] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStartLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#FFF5E4]/20 border-t-[#FFF5E4] rounded-full animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  "Start Game"
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}

export default Guess;
