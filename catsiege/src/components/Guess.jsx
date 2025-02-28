import React, { useState, useRef } from "react";
import orb from "../assets/guess-start4.png";
import GuessingGame from "../components/GuessGame";

import example from "../assets/example.webp";
import { motion, AnimatePresence } from "framer-motion";

import bgMusic from "../assets/guess-music.mp3";
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
  const [selectedDifficulty, setSelectedDifficulty] = useState(256);
  const [selectedEntryPrice, setSelectedEntryPrice] = useState(5);

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

      // Deduct selected entry price via API
      const response = await authService.updatePoints(-selectedEntryPrice);

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

  const handleShowConfirmation = () => {
    setSelectedEntryPrice(5);
    setShowConfirmation(true);
  };

  React.useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  return (
    <section className="relative w-screen  h-fit py-12 md:py-48 bg-[url('./assets/guess-game-bgg.webp')] bg-no-repeat bg-center bg-cover flex justify-center items-center">
      <AnimatePresence mode="wait">
        {activeTab === "" && (
          <motion.div
            key="main-menu"
            variants={mainContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`relative w-[90vw] sm:w-[600px] flex flex-col items-center h-[80vh] bg-black/50 border4 backdrop-blur-sm rounded-xl shadow-f  p-8`}
          >
            <h1 className=" text-4xl text-center font-bold z-10 text-[#D5BA8F]">
              The haunted number
            </h1>
            <span className=" text-2xl mt-4 text-center font-bold z-10 text-[#D5BA8F]">
              Minigame
            </span>
            <div className="border-b-4 border-[#D5BA8F] w-full mt-4 rounded-full" />

            <div className="w-[500px] h-[80vh] md:h-[600px] flex flex-col gap-7 justify-center text-center items-center px-6">
              <motion.button
                onClick={handleShowConfirmation}
                className="z-10 text-center font-bold text-3xl h-16 w-[350px] rounded-lg frame4 backdrop-blur-sm text-[#FFF5E4]  transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                START
              </motion.button>

              <motion.button
                onClick={setRules}
                className="z-10 text-center font-bold text-3xl h-16 w-[350px] rounded-lg frame4 backdrop-blur-sm text-[#FFF5E4] transition-all"
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
            <div className="relative w-[90vw] sm:w-[600px] h-[80vh] bg-black/50 backdrop-blur-sm rounded-xl border4 shadow-f p-8">
              <div className="flex flex-col items-center  h-[85%]">
                <h1 className="text-3xl font-bold text-[#D5BA8F] mb-8">
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
                          The darkness whispers you a challenge, a secret number
                          hides in the shadows.
                        </p>

                        <p className="text-lg bold text-center">
                          Uncover the hidden number in the selected range before
                          your opponent.
                        </p>
                        <img
                          src={example}
                          className="rounded md:block hidden"
                        />
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
                  className=" px-8 py-2 rounded-lg frame4 text-[#FFF5E4] transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Back
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab == "game" && (
          <GuessingGame
            onBackToMenu={handleBackToMenu}
            audioRef={audioRef}
            difficulty={selectedDifficulty}
            entryPrice={selectedEntryPrice}
          />
        )}
      </AnimatePresence>

      {/* Enhanced Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/80 z-[1000] flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-black/90 p-8 rounded-xl border border-[#FFF5E4]/20 max-w-md w-full mx-4"
          >
            {!user ? (
              // Scenario 1: User not logged in
              <>
                <h2 className="text-2xl text-center font-bold text-[#FFF5E4] mb-4">
                  Login Required
                </h2>
                <p className="text-[#FFF5E4]/80 text-center mb-8">
                  You need to be logged in to play this game!
                </p>
                <div className="flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => (window.location.href = "/login")}
                    className="px-6 py-2 font-bold bg-[#FFF5E4]/10 hover:bg-[#FFF5E4]/20 text-[#FFF5E4] rounded-lg"
                  >
                    Login Now
                  </motion.button>
                </div>
              </>
            ) : user.points === 0 ? (
              // Scenario 2: User has 0 points
              <>
                <h2 className="text-2xl text-center font-bold text-[#FFF5E4] mb-4">
                  Insufficient Points
                </h2>
                <div className="bg-[#FFF5E4]/5 rounded-lg p-4 mb-6">
                  <p className="text-[#FFF5E4]/80 text-center mb-4">
                    You can't play this game because you have 0 points.
                  </p>
                  <p className="text-[#FFF5E4]/80 text-center">
                    Click on your account menu in the top right corner and check
                    if you can claim points to play!
                  </p>
                </div>
                <div className="flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowConfirmation(false)}
                    className="px-6 py-2 font-bold bg-[#FFF5E4]/10 hover:bg-[#FFF5E4]/20 text-[#FFF5E4] rounded-lg"
                  >
                    Got It
                  </motion.button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl text-center font-bold text-[#FFF5E4] mb-8">
                  Game Options
                </h2>

                {/* Difficulty Selection */}
                <div className="mb-8">
                  <h3 className="text-[#FFF5E4] font-bold mb-4">
                    Select Difficulty
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 128, label: "Easy" },
                      { value: 256, label: "Medium" },
                      { value: 512, label: "Hard" },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setSelectedDifficulty(value)}
                        className={`relative py-4 px-3 rounded-lg font-bold transition-all overflow-hidden
                          ${
                            selectedDifficulty === value
                              ? "bg-gradient-to-br from-[#FFF5E4]/30 to-[#FFF5E4]/10 border border-[#FFF5E4]/40"
                              : "bg-black/40 hover:bg-black/60 border border-[#FFF5E4]/10"
                          }`}
                      >
                        <div className="relative z-10">
                          <span className="block text-lg text-[#FFF5E4] mb-1">
                            {label}
                          </span>
                          <span
                            className={`block text-md ${
                              selectedDifficulty === value
                                ? "text-[#FBE294]"
                                : "text-[#FFF5E4]/60"
                            }`}
                          >
                            1-{value}
                          </span>
                        </div>
                        {selectedDifficulty === value && (
                          <div className="absolute inset-0 bg-[#FFF5E4]/5 animate-pulse" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Entry Price Selection
                <div className="mb-8">
                  <h3 className="text-[#FFF5E4] font-bold mb-4">
                    Select Entry Price
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[{ value: 5, label: "Low" }].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setSelectedEntryPrice(value)}
                        className={`relative py-4 px-3 rounded-lg font-bold transition-all overflow-hidden
                          ${
                            selectedEntryPrice === value
                              ? "bg-gradient-to-br from-[#FFF5E4]/30 to-[#FFF5E4]/10 border border-[#FFF5E4]/40"
                              : "bg-black/40 hover:bg-black/60 border border-[#FFF5E4]/10"
                          }`}
                      >
                        <div className="relative z-10">
                          <span className="block text-lg text-[#FFF5E4] mb-1">
                            {label}
                          </span>
                          <span
                            className={`block text-md ${
                              selectedEntryPrice === value
                                ? "text-[#FBE294]"
                                : "text-[#FFF5E4]/60"
                            }`}
                          >
                            {value} points
                          </span>
                        </div>
                        {selectedEntryPrice === value && (
                          <div className="absolute inset-0 bg-[#FFF5E4]/5 animate-pulse" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                */}

                {/* Points Summary */}
                <div className="bg-gradient-to-br from-black/60 to-black/40 rounded-lg p-6 mb-8 border border-[#FFF5E4]/10">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[#FFF5E4]/80">Current Balance:</span>
                    <span className="text-[#FFF5E4] font-bold text-lg">
                      {user.points} points
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[#FFF5E4]/80">Game Cost:</span>
                    <span className="text-red-400 font-bold text-lg">
                      -{selectedEntryPrice} points
                    </span>
                  </div>
                  <div className="pt-3 border-t border-[#FFF5E4]/10">
                    <div className="flex justify-between items-center">
                      <span className="text-[#FFF5E4]/80">Balance After:</span>
                      <span className="text-[#FFF5E4] font-bold text-lg">
                        {user.points - selectedEntryPrice} points
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowConfirmation(false)}
                    className="px-6 py-3 font-bold text-[#FFF5E4]/60 hover:text-[#FFF5E4] transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStartGameConfirm}
                    disabled={
                      user.points < selectedEntryPrice || isStartLoading
                    }
                    className="px-8 py-3 font-bold bg-gradient-to-r from-[#FFF5E4]/20 to-[#FFF5E4]/10 hover:from-[#FFF5E4]/30 hover:to-[#FFF5E4]/20 
                    text-[#FFF5E4] rounded-lg border border-[#FFF5E4]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
              </>
            )}
          </motion.div>
        </div>
      )}
    </section>
  );
}

export default Guess;
