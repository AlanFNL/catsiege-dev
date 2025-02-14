import React, { useState, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";
import orb from "../assets/guess-start4.png";
import time from "../assets/guess-game5.png";

import catopponent from "../assets/catopponent.webp";

import * as Slider from "@radix-ui/react-slider";

import { useAuth } from "../contexts/AuthContext";

import { Info, Volume2, VolumeX } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Accordion from "@radix-ui/react-accordion";
import { authService, gameService } from "../services/api";

const TURN_MULTIPLIERS = {
  0: 1.7,
  1: 1.25,
  2: 1.08,
  3: 1.04,
  4: 0.92,
  5: 0.84,
  6: 0.76,
  7: 0.68,
};

// Add these variants for animations
const cpuTurnVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

const feedbackVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const GuessingGame = ({ onBackToMenu, audioRef }) => {
  const [stage, setStage] = useState("playing");
  const [rangeMax] = useState(256);
  const [secretNumber, setSecretNumber] = useState(null);
  const [userGuess, setUserGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [turns, setTurns] = useState(0);
  const [multiplier, setMultiplier] = useState(20);
  const [score, setScore] = useState(0);
  const [hasWon, setHasWon] = useState(false);
  const [minRange, setMinRange] = useState(1);
  const [maxRange, setMaxRange] = useState(256);
  const [guessedRanges, setGuessedRanges] = useState([]);
  const [isCpuTurn, setIsCpuTurn] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const MAX_TURNS = 15;
  const [timeLeft, setTimeLeft] = useState(10);
  const [timerActive, setTimerActive] = useState(false);
  const TURN_TIME_LIMIT = 15; // seconds
  const [currentMultiplier, setCurrentMultiplier] = useState(
    TURN_MULTIPLIERS[0]
  );
  const { user, setUser } = useAuth();
  const ENTRY_PRICE = 5;
  const [cpuFeedback, setCpuFeedback] = useState(null);
  const [finalPoints, setFinalPoints] = useState({
    previousBalance: 0,
    earned: 0,
    newBalance: 0,
  });
  const [playerTurns, setPlayerTurns] = useState(0);
  const [isGuessButtonDisabled, setIsGuessButtonDisabled] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Add new state for session management
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Add loading state for guess button
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or resume game session
  useEffect(() => {
    const initializeGame = async () => {
      try {
        setIsLoading(true);
        // Try to get existing session
        const session = await gameService.getGameSession();

        if (session) {
          // Resume existing game
          setSessionId(session.id);
          setSecretNumber(session.secretNumber);
          setTurns(session.turns);
          setPlayerTurns(session.playerTurns);
          setMinRange(session.minRange);
          setMaxRange(session.maxRange);
          setCurrentMultiplier(session.currentMultiplier);
          setIsCpuTurn(session.isCpuTurn);
          setTimeLeft(session.timeLeft);
          setTimerActive(true);
        } else {
          // Create new session
          const newSession = await gameService.createGameSession();
          setSessionId(newSession.id);
          resetLocalState(newSession);
        }
      } catch (error) {
        console.error("Failed to initialize game:", error);
        // Handle error appropriately
      } finally {
        setIsLoading(false);
      }
    };

    initializeGame();
  }, []);

  useEffect(() => {
    let timeoutId;

    if (isCpuTurn && !gameOver) {
      timeoutId = setTimeout(async () => {
        try {
          const cpuGuess = Math.floor((minRange + maxRange) / 2);
          setCpuFeedback(`CPU guesses: ${cpuGuess}`);

          const result = await gameService.submitGuess({
            guess: cpuGuess,
            isCpu: true,
          });

          if (result.result === "win") {
            setCpuFeedback("CPU won!");
            setHasWon(false);
            handleGameEnd(false, result);
          } else {
            // Set CPU feedback based on comparison
            if (cpuGuess < result.secretNumber) {
              setCpuFeedback(`CPU guessed ${cpuGuess} - Higher!`);
            } else {
              setCpuFeedback(`CPU guessed ${cpuGuess} - Lower!`);
            }

            // Update game state
            setMinRange(result.minRange);
            setMaxRange(result.maxRange);
            setTurns(result.turns);
            setPlayerTurns(result.playerTurns);
            setCurrentMultiplier(result.currentMultiplier);
            setIsCpuTurn(result.isCpuTurn);
            setTimeLeft(TURN_TIME_LIMIT);
            setTimerActive(!result.isCpuTurn);
          }
        } catch (error) {
          console.error("CPU guess failed:", error);
          setCpuFeedback("CPU turn failed");
        }
      }, 2000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isCpuTurn, minRange, maxRange, gameOver]);

  useEffect(() => {
    let timerId;

    if (timerActive && !isCpuTurn && !gameOver && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    // Handle time running out
    if (timeLeft === 0 && !isCpuTurn && !gameOver) {
      const handleTimeout = async () => {
        setTimerActive(false);
        const randomGuess =
          Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;
        setUserGuess(randomGuess.toString());
        await handleGuessSubmit();
      };
      handleTimeout();
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [timeLeft, timerActive, isCpuTurn, gameOver, minRange, maxRange]);

  // Initialize timer when component mounts
  useEffect(() => {
    setTimeLeft(TURN_TIME_LIMIT);
    setTimerActive(true);
  }, []);

  useEffect(() => {
    // Update multiplier based on player turns
    const newMultiplier = TURN_MULTIPLIERS[playerTurns] || TURN_MULTIPLIERS[0];

    setCurrentMultiplier(newMultiplier);
  }, [playerTurns]);

  // Calculate winnings with decimal precision
  const calculateWinnings = () => {
    if (!currentMultiplier) return 0;

    // Calculate total winnings (entry price * multiplier)
    const totalWinnings = ENTRY_PRICE * currentMultiplier;

    // Calculate net winnings (total winnings - entry price)
    const netWinnings = totalWinnings - ENTRY_PRICE;

    // Round to 2 decimal places
    return Number(netWinnings.toFixed(2));
  };

  // Modified handleGuess to use server validation
  const handleGuess = async (guess, isCpu = false) => {
    if (!sessionId) return;

    try {
      const result = await gameService.submitGuess({
        sessionId,
        guess,
        isCpu,
      });

      // Update local state based on server response
      setMinRange(result.minRange);
      setMaxRange(result.maxRange);
      setTurns(result.turns);
      setPlayerTurns(result.playerTurns);
      setCurrentMultiplier(result.currentMultiplier);
      setTimeLeft(TURN_TIME_LIMIT);

      if (result.gameOver) {
        await handleGameEnd(result.hasWon);
      } else if (!isCpu) {
        setIsCpuTurn(true);
        setTimerActive(false);
        // CPU turn logic remains similar but uses server validation
      }
    } catch (error) {
      console.error("Failed to submit guess:", error);
      // Handle error appropriately
    }
  };

  // Modified handleGameEnd to use server endpoint
  const handleGameEnd = async (hasWon) => {
    try {
      const result = await gameService.endGameSession();

      setFinalPoints({
        previousBalance: result.previousBalance,
        earned: result.earned,
        newBalance: result.newBalance,
      });

      // Update user context with new balance
      setUser((prev) => ({
        ...prev,
        points: result.newBalance,
      }));

      setGameOver(true);
      setStage("result");
    } catch (error) {
      console.error("Failed to end game:", error);
      // Handle error appropriately
    }
  };

  // Modified resetGame to create new session
  const resetGame = async () => {
    try {
      const newSession = await gameService.createGameSession();
      setSessionId(newSession.id);
      resetLocalState(newSession);
    } catch (error) {
      console.error("Failed to reset game:", error);
      // Handle error appropriately
    }
  };

  // Helper function to reset local state
  const resetLocalState = (sessionData) => {
    setSecretNumber(null); // Server knows the secret number
    setUserGuess("");
    setFeedback("");
    setTurns(0);
    setPlayerTurns(0);
    setMultiplier(20);
    setScore(0);
    setHasWon(false);
    setMinRange(1);
    setMaxRange(256);
    setGuessedRanges([]);
    setIsCpuTurn(false);
    setGameOver(false);
    setTimeLeft(TURN_TIME_LIMIT);
    setTimerActive(true);
    setCurrentMultiplier(TURN_MULTIPLIERS[0]);
    setFinalPoints({
      previousBalance: 0,
      earned: 0,
      newBalance: 0,
    });
  };

  // Modified handleGuessSubmit to include loading state and feedback
  const handleGuessSubmit = async () => {
    if (!isCpuTurn && !gameOver && userGuess && !isSubmitting) {
      setIsSubmitting(true);
      try {
        const result = await gameService.submitGuess({
          guess: parseInt(userGuess),
        });

        if (result.result === "win") {
          setFeedback("Correct! You won!");
          setHasWon(true);
          handleGameEnd(true, result);
        } else {
          // Set feedback based on comparison
          const guessNum = parseInt(userGuess);
          if (guessNum < result.secretNumber) {
            setFeedback("Higher!");
          } else {
            setFeedback("Lower!");
          }

          // Update game state based on server response
          setMinRange(result.minRange);
          setMaxRange(result.maxRange);
          setTurns(result.turns);
          setPlayerTurns(result.playerTurns);
          setCurrentMultiplier(result.currentMultiplier);
          setIsCpuTurn(result.isCpuTurn);
          setTimeLeft(TURN_TIME_LIMIT);
          setTimerActive(!result.isCpuTurn);
          setUserGuess(""); // Clear the guess after submission
        }
      } catch (error) {
        console.error("Failed to submit guess:", error);
        setFeedback("Error submitting guess. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSliderChange = (values) => {
    const value = values[0];
    const boundedValue = Math.max(minRange, Math.min(value, maxRange));
    setUserGuess(boundedValue.toString());
  };

  // Handle back to menu with proper reset
  const handleBack = () => {
    resetGame();
    onBackToMenu();
  };

  // Initialize game
  useEffect(() => {
    // Start with first turn multiplier (index 0)
    setCurrentMultiplier(TURN_MULTIPLIERS[0]);
  }, []);

  // Add button cooldown after guess
  const handleGuessWithCooldown = async () => {
    if (isGuessButtonDisabled || !userGuess) return;

    setIsGuessButtonDisabled(true);
    await handleGuessSubmit();

    setTimeout(() => {
      setIsGuessButtonDisabled(false);
    }, 1000);
  };

  const handleMuteToggle = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      {stage === "playing" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative w-[90vw] max-w-4xl mx-auto"
        >
          {/* Main Game Container */}
          <div className="relative bg-black/50 backdrop-blur-sm border border-[#FFF5E4]/20 rounded-xl p-8 shadow-2xl">
            {/* Header */}
            <h1 className="text-3xl font-bold text-center text-[#FFF5E4] mb-8">
              YOUR TURN
            </h1>
            {/* Info Button */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={handleMuteToggle}
                className="p-2 rounded-full bg-[#FFF5E4]/10 hover:bg-[#FFF5E4]/20 transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-[#FFF5E4]/70" />
                ) : (
                  <Volume2 className="w-5 h-5 text-[#FFF5E4]/70" />
                )}
              </button>
              <button
                onClick={() => setIsInfoOpen(true)}
                className="p-2 rounded-full bg-[#FFF5E4]/10 hover:bg-[#FFF5E4]/20 transition-colors"
                aria-label="Game Information"
              >
                <Info className="w-5 h-5 text-[#FFF5E4]/70" />
              </button>
            </div>
            {/* Number Range Display */}
            {!feedback && !isCpuTurn && (
              <div className="text-center mb-12">
                <p className="text-[#FFF5E4]/80 text-xl mb-4">
                  Choose a number between
                </p>
                <div className="flex justify-center items-center gap-8">
                  <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-[#FFF5E4]/20 to-[#FFF5E4]/5 border border-[#FFF5E4]/30 flex items-center justify-center">
                    <span className="text-2xl sm:text-5xl font-bold text-[#FFF5E4]">
                      {minRange}
                    </span>
                  </div>
                  <span className="text-[#FFF5E4]/60">and</span>
                  <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-[#FFF5E4]/20 to-[#FFF5E4]/5 border border-[#FFF5E4]/30 flex items-center justify-center">
                    <span className="text-2xl sm:text-5xl font-bold text-[#FFF5E4]">
                      {maxRange}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Slider Section */}
            <div className="w-full space-y-8 mt-8">
              <div className="relative px-12">
                {/* Keep existing Slider.Root component */}
                <Slider.Root
                  className="relative flex items-center select-none touch-none w-full h-8"
                  value={[parseInt(userGuess) || minRange]}
                  max={maxRange || rangeMax}
                  min={minRange}
                  step={1}
                  onValueChange={handleSliderChange}
                >
                  {/* Track background */}
                  <Slider.Track className="relative h-4 w-full grow rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#3c3b37] via-[#504d45] to-[#3c3b37]" />

                    {/* Filled track */}
                    <Slider.Range className="absolute h-full bg-gradient-to-r from-[#c4b48d] via-[#FBE294] to-[#FBE294]" />
                  </Slider.Track>

                  {/* Thumb with number */}
                  <Slider.Thumb className="block w-8 h-8 rounded-full bg-gradient-to-br from-[#d4d0c5] to-[#a39f8f] shadow-lg ring-2 ring-[#847f6f] focus:outline-none">
                    <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-4xl font-bold text-[#FBE294]">
                      {userGuess || minRange}
                    </span>
                  </Slider.Thumb>
                </Slider.Root>
              </div>

              {/* Game Stats */}
              <div className="flex justify-center gap-12 text-xl text-[#FFF5E4]/90">
                <div className="flex items-center gap-2">
                  <img src={orb} alt="" className="h-8 w-8" />
                  <span>x{currentMultiplier.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={time} className="h-8 w-8" />
                  <span>{timerActive ? `${timeLeft}s` : "--"}</span>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGuessWithCooldown}
                disabled={
                  isSubmitting ||
                  isGuessButtonDisabled ||
                  !userGuess ||
                  isCpuTurn
                }
                className="px-6 py-2 font-bold bg-[#FFF5E4]/10 hover:bg-[#FFF5E4]/20 text-[#FFF5E4] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#FFF5E4]/20 border-t-[#FFF5E4] rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  "Choose Number"
                )}
              </motion.button>
            </div>
          </div>

          {/* Timer warning only shows when timer is active */}
          {timerActive && !isCpuTurn && timeLeft <= 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute z-[100] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500 text-6xl font-bold"
            >
              {timeLeft}
            </motion.div>
          )}

          {/* Replace the CPU Turn Overlay */}
          <AnimatePresence>
            {isCpuTurn && !gameOver && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={cpuTurnVariants}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
              >
                <div className="relative bg-black/50 border border-[#FFF5E4]/20 rounded-xl p-8 max-w-xl w-full mx-4">
                  <h2 className="text-3xl font-bold text-center text-[#FFF5E4] mb-8">
                    CPU TURN
                  </h2>

                  <div className="relative flex flex-col items-center">
                    {/* Opponent Image with Conditional Glow */}
                    <div
                      className={`relative rounded-full overflow-hidden mb-8 ${
                        cpuFeedback
                          ? cpuFeedback === "HIGHER!"
                            ? "shadow-[0_0_30px_rgba(34,197,94,0.5)]"
                            : "shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                          : ""
                      }`}
                    >
                      <img
                        src={catopponent}
                        alt="CPU"
                        className="w-48 h-48 object-cover"
                      />
                    </div>

                    {/* Show CPU's calculated guess */}
                    {cpuFeedback && (
                      <div className="text-2xl text-[#FFF5E4]/80 mb-4">
                        {cpuFeedback}
                      </div>
                    )}

                    {/* Loading Animation when no feedback */}
                    {!cpuFeedback && (
                      <div className="flex gap-2 justify-center mb-4">
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatType: "loop",
                          }}
                          className="w-3 h-3 bg-[#FFF5E4] rounded-full"
                        />
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 1.5,
                            delay: 0.2,
                            repeat: Infinity,
                            repeatType: "loop",
                          }}
                          className="w-3 h-3 bg-[#FFF5E4] rounded-full"
                        />
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 1.5,
                            delay: 0.4,
                            repeat: Infinity,
                            repeatType: "loop",
                          }}
                          className="w-3 h-3 bg-[#FFF5E4] rounded-full"
                        />
                      </div>
                    )}

                    {/* Feedback Text */}
                    <AnimatePresence mode="wait">
                      {cpuFeedback && (
                        <motion.div
                          variants={feedbackVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className={`text-6xl font-bold ${
                            cpuFeedback === "HIGHER!"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {cpuFeedback}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
            >
              <div className="bg-gray-900/90 p-8 rounded-xl border-2 border-yellow-500">
                <h2 className="text-2xl font-bold text-yellow-500 mb-4">
                  {hasWon
                    ? "You Won!"
                    : turns > MAX_TURNS
                    ? "Out of Turns!"
                    : multiplier <= 0
                    ? "Multiplier Depleted!"
                    : "CPU Won!"}
                </h2>
                <p className="text-white">
                  {turns > MAX_TURNS
                    ? "You've exceeded the maximum number of turns!"
                    : multiplier <= 0
                    ? "You ran out of multiplier power!"
                    : `The number was: ${secretNumber}`}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {stage === "result" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <div className="relative max-w-2xl w-[90vw] flex flex-col items-center">
            {/* Top Banner */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full bg-gradient-to-r from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] rounded-t-xl border-t border-x border-[#FFF5E4]/20 p-8"
            >
              <h1 className="text-4xl font-bold text-center text-[#FFF5E4] tracking-wider">
                CONGRATULATIONS!
              </h1>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="w-full bg-gradient-to-b from-black/90 to-black/70 border-b border-x border-[#FFF5E4]/20 p-8 space-y-8"
            >
              {/* Add secret number display */}
              <div className="text-center">
                <span className="text-[#FFF5E4]/70">Secret Number: </span>
                <span className="text-[#FBE294] font-bold text-2xl">
                  {secretNumber}
                </span>
              </div>

              {/* Flavor Text */}
              <div className="space-y-4 text-center">
                <p className="text-[#FFF5E4]/80 italic text-lg">
                  The shadows recede as you uncover the secret number.
                </p>
                <p className="text-[#FFF5E4]/80 italic text-lg">
                  You've outwitted the night.
                </p>
              </div>

              {/* Balance Section with proper number formatting */}
              <div className="border-t border-b border-[#FFF5E4]/20 py-6 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[#FFF5E4]/70">Previous Balance:</span>
                  <span className="text-[#FFF5E4] font-bold">
                    {finalPoints.previousBalance?.toFixed(2)} points
                  </span>
                </div>

                <div className="bg-[#FFF5E4]/5 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#FFF5E4]/70">
                      Multiplier Earned:
                    </span>
                    <div className="flex items-center gap-2">
                      <img src={orb} alt="" className="w-6 h-6" />
                      <span className="text-[#FBE294] font-bold">
                        x{currentMultiplier?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#FFF5E4]/70">Points Earned:</span>
                    <span className="text-green-400 font-bold">
                      +{finalPoints.earned.toFixed(2)} points
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-[#FFF5E4]/10">
                  <span className="text-[#FFF5E4]/70">New Balance:</span>
                  <span className="text-[#FFF5E4] font-bold text-lg">
                    {finalPoints.newBalance?.toFixed(2)} points
                  </span>
                </div>
              </div>

              {/* Bottom Flavor Text */}
              <p className="text-[#FFF5E4]/80 italic text-center text-lg">
                The shadows may fade, but your victory echoes through the dark.
              </p>
            </motion.div>

            {/* Back Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              className="mt-8 px-12 py-3 bg-gradient-to-r from-[#FFF5E4]/10 via-[#FFF5E4]/20 to-[#FFF5E4]/10 
                        hover:from-[#FFF5E4]/20 hover:via-[#FFF5E4]/30 hover:to-[#FFF5E4]/20
                        border border-[#FFF5E4]/30 rounded-lg text-[#FFF5E4] font-bold text-xl
                        transition-all duration-300"
            >
              BACK
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Info Dialog */}
      <Dialog.Root open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-[#1a1a1a] rounded-lg p-6 shadow-xl">
            <Dialog.Title className="text-xl font-bold text-[#FFF5E4] mb-4">
              How to Play
            </Dialog.Title>

            <div className="space-y-4 text-[#FFF5E4]/80">
              <p>🎯 Guess the secret number between 1 and 256.</p>
              <p>🤖 You'll play against a CPU that takes turns after you.</p>
              <p>⚡ Every turn you make weakens your reward multiplier.</p>
              <p>💫 CPU turns don't affect your multiplier.</p>

              <Accordion.Root type="single" collapsible>
                <Accordion.Item value="multipliers">
                  <Accordion.Trigger className="flex justify-between w-full py-2 text-[#FBE294]">
                    View Multiplier Table
                    <span>▼</span>
                  </Accordion.Trigger>
                  <Accordion.Content className="pt-2">
                    <div className="bg-[#FFF5E4]/5 rounded p-3 space-y-1">
                      {Object.entries(TURN_MULTIPLIERS).map(
                        ([turn, multiplier]) => (
                          <div
                            key={turn}
                            className="flex justify-between text-sm"
                          >
                            <span>Turn {parseInt(turn)}</span>
                            <span className="text-[#FBE294]">
                              x{multiplier}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              </Accordion.Root>
            </div>

            <Dialog.Close asChild>
              <button className="mt-6 w-full py-2 px-4 bg-[#FFF5E4]/10 hover:bg-[#FFF5E4]/20 rounded transition-colors text-[#FFF5E4]">
                Got it!
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default GuessingGame;
