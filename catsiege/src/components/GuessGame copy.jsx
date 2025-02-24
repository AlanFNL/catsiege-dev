import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Slider from "@radix-ui/react-slider";
import * as Dialog from "@radix-ui/react-dialog";
import * as Accordion from "@radix-ui/react-accordion";
import { Info, Volume2, VolumeX } from "lucide-react";

// Assets
import orb from "../assets/guess-start4.png";
import time from "../assets/guess-game5.png";
import catopponent from "../assets/catopponent.webp";

// Services
import { authService, gameService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

// Constants
import {
  TURN_MULTIPLIERS,
  MAX_TURNS,
  TURN_TIME_LIMIT,
  ENTRY_PRICE,
} from "./GuessGame/constants";

// Components
import { GameHeader } from "./GuessGame/GameHeader";
import { NumberRangeDisplay } from "./GuessGame/NumberRangeDisplay";
import { SliderSection } from "./GuessGame/SliderSection";
import { GameStats } from "./GuessGame/GameStats";
import { CPUTurnOverlay } from "./GuessGame/CPUTurnOverlay";
import { GameOverModal } from "./GuessGame/GameOverModal";
import { ResultsScreen } from "./GuessGame/ResultsScreen";
import { InfoDialog } from "./GuessGame/InfoDialog";

// Animation variants
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

const GuessingGame = ({
  onBackToMenu,
  audioRef,
  difficulty = 256,
  entryPrice = 5,
}) => {
  // Add difficulty level state based on the difficulty prop
  const getDifficultyLevel = (difficultyValue) => {
    if (difficultyValue <= 128) return "easy";
    if (difficultyValue <= 256) return "medium";
    return "hard";
  };

  const difficultyLevel = getDifficultyLevel(difficulty);

  // State management
  const [stage, setStage] = useState("playing");
  const [rangeMax] = useState(difficulty);
  const [secretNumber, setSecretNumber] = useState(null);
  const [userGuess, setUserGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [turns, setTurns] = useState(0);
  const [multiplier, setMultiplier] = useState(20);
  const [score, setScore] = useState(0);
  const [hasWon, setHasWon] = useState(false);
  const [minRange, setMinRange] = useState(1);
  const [maxRange, setMaxRange] = useState(difficulty);
  const [guessedRanges, setGuessedRanges] = useState([]);
  const [isCpuTurn, setIsCpuTurn] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [timerActive, setTimerActive] = useState(false);
  const [currentMultiplier, setCurrentMultiplier] = useState(
    TURN_MULTIPLIERS[difficultyLevel][0]
  );
  const [cpuState, setCpuState] = useState({ guess: null, feedback: null });
  const [finalPoints, setFinalPoints] = useState({
    previousBalance: 0,
    earned: 0,
    newBalance: 0,
    multiplierUsed: 0,
  });
  const [playerTurns, setPlayerTurns] = useState(0);
  const [isGuessButtonDisabled, setIsGuessButtonDisabled] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasUpdatedPoints, setHasUpdatedPoints] = useState(false);
  const [isGameEnding, setIsGameEnding] = useState(false);

  const { user, setUser } = useAuth();

  // Game logic functions
  const resetGame = () => {
    setSecretNumber(Math.floor(Math.random() * difficulty) + 1);
    setUserGuess("");
    setFeedback("");
    setTurns(0);
    setPlayerTurns(0);
    setMultiplier(20);
    setScore(0);
    setHasWon(false);
    setMinRange(1);
    setMaxRange(difficulty);
    setGuessedRanges([]);
    setIsCpuTurn(false);
    setGameOver(false);
    setTimeLeft(TURN_TIME_LIMIT);
    setTimerActive(true);
    setCurrentMultiplier(TURN_MULTIPLIERS[difficultyLevel][0]);
    setHasUpdatedPoints(false);
    setFinalPoints({
      previousBalance: 0,
      earned: 0,
      newBalance: 0,
      multiplierUsed: 0,
    });
  };

  const handleGameEnd = async (hasWon, multiplierUsedFromParam = undefined) => {
    console.log("=== handleGameEnd called ===");
    console.log("hasWon:", hasWon);
    console.log("multiplierUsedFromParam:", multiplierUsedFromParam);
    console.log("currentMultiplier:", currentMultiplier);
    console.log("hasUpdatedPoints:", hasUpdatedPoints);
    console.log("gameOver:", gameOver);
    console.log("isCpuTurn:", isCpuTurn);

    const usedMultiplier =
      multiplierUsedFromParam !== undefined
        ? multiplierUsedFromParam
        : currentMultiplier;
    setLoading(true);
    setHasWon(hasWon);

    try {
      if (!hasUpdatedPoints) {
        console.log("Attempting to update points...");
        const previousBalance = user?.points || 0;
        const pointsChange = hasWon
          ? Number((entryPrice * usedMultiplier).toFixed(2))
          : -entryPrice;

        console.log("Points calculation:", {
          previousBalance,
          pointsChange,
          usedMultiplier,
        });

        if (hasWon) {
          await gameService.recordGameStats({
            turnsToWin: playerTurns,
            endingMultiplier: usedMultiplier,
            difficulty,
            entryPrice,
          });
        }

        const response = await authService.updatePoints(pointsChange);
        console.log("Points updated:", response);
        setHasUpdatedPoints(true);

        setFinalPoints({
          previousBalance,
          earned: pointsChange,
          newBalance: response.points,
          multiplierUsed: usedMultiplier,
        });

        setUser((prev) => ({
          ...prev,
          points: response.points,
        }));
      } else {
        console.log("Points already updated, skipping update");
      }
    } catch (error) {
      console.error("Failed to update points or record stats:", error);
      setFinalPoints((prev) => ({
        ...prev,
        previousBalance: user?.points || 0,
        earned: 0,
        newBalance: user?.points || 0,
        multiplierUsed: usedMultiplier,
      }));
    }

    setGameOver(true);
    setStage("result");
    setLoading(false);
  };

  const handleGuess = (guess, isCpu = false) => {
    console.log("=== handleGuess called ===");
    console.log("guess:", guess);
    console.log("isCpu:", isCpu);
    console.log("gameOver:", gameOver);
    console.log("currentMultiplier:", currentMultiplier);
    console.log("playerTurns:", playerTurns);
    console.log("secretNumber:", secretNumber);

    setLoading(true);
    const numericGuess = parseInt(guess, 10);

    // Early return if game is already over
    if (gameOver) {
      console.log("Game is already over, returning early");
      setLoading(false);
      return;
    }

    // Check if guess is correct first
    if (numericGuess === secretNumber) {
      console.log("Correct guess! Ending game with win");
      setGameOver(true); // Set game over immediately
      handleGameEnd(true, currentMultiplier);
      setLoading(false);
      return;
    }

    // Only update turns and multiplier if game is still going
    if (!isCpu) {
      const newPlayerTurn = playerTurns + 1;
      console.log("Player turn update:", {
        currentTurn: playerTurns,
        newTurn: newPlayerTurn,
        maxTurns: MAX_TURNS,
      });

      // Check for max turns before processing the guess
      if (newPlayerTurn > MAX_TURNS) {
        console.log("Max turns reached, ending game");
        setGameOver(true); // Set game over immediately
        handleGameEnd(false);
        setLoading(false);
        return;
      }
      const computedMultiplier =
        TURN_MULTIPLIERS[difficultyLevel][newPlayerTurn] ||
        TURN_MULTIPLIERS[difficultyLevel][0];
      console.log("New multiplier computed:", computedMultiplier);

      setPlayerTurns(newPlayerTurn);
      setCurrentMultiplier(computedMultiplier);
    }

    // Process the guess
    setTurns((prev) => prev + 1);

    // If guess is incorrect, update ranges and continue game
    if (numericGuess < secretNumber) {
      console.log("Guess too low, updating range");
      handleLowerGuess(numericGuess, isCpu);
    } else {
      console.log("Guess too high, updating range");
      handleHigherGuess(numericGuess, isCpu);
    }

    setLoading(false);
  };

  const handleLowerGuess = (numericGuess, isCpu) => {
    const newMin = numericGuess;
    setMinRange(newMin);
    setGuessedRanges((prevRanges) => [
      ...prevRanges,
      { min: minRange, max: numericGuess },
    ]);
    setUserGuess(numericGuess.toString());

    if (!isCpu) {
      handleCPUTurn(newMin, maxRange);
    }
  };

  const handleHigherGuess = (numericGuess, isCpu) => {
    const newMax = numericGuess;
    setMaxRange(newMax);
    setGuessedRanges((prevRanges) => [
      ...prevRanges,
      { min: numericGuess, max: maxRange },
    ]);
    setUserGuess(numericGuess.toString());

    if (!isCpu) {
      handleCPUTurn(minRange, newMax);
    }
  };

  const handleCPUTurn = (min, max) => {
    console.log("=== handleCPUTurn called ===");
    console.log("min:", min);
    console.log("max:", max);
    console.log("gameOver:", gameOver);
    console.log("isCpuTurn:", isCpuTurn);

    // Don't process CPU turn if game is over
    if (gameOver) {
      console.log("Game is over, skipping CPU turn");
      return;
    }

    setIsCpuTurn(true);
    setTimerActive(false);

    const cpuGuess = Math.floor((min + max) / 2);
    console.log("CPU calculated guess:", cpuGuess);

    setTimeout(() => {
      setCpuState({
        guess: cpuGuess,
        feedback:
          cpuGuess === secretNumber
            ? "FOUND IT!"
            : cpuGuess < secretNumber
            ? "HIGHER!"
            : "LOWER!",
      });
      setTimeout(() => {
        console.log("CPU making guess:", cpuGuess);
        if (cpuGuess === secretNumber) {
          setIsGameEnding(true);
          setTimeout(() => {
            handleGuess(cpuGuess, true);
            setStage("result");
            setIsGameEnding(false);
          }, 2000);
        } else {
          handleGuess(cpuGuess, true);
          // Only switch turns if game isn't over
          if (!gameOver) {
            console.log("Game not over, switching back to player");
            setIsCpuTurn(false);
            setCpuState({ guess: null, feedback: null });
            setTimeLeft(TURN_TIME_LIMIT);
            setTimerActive(true);
          } else {
            console.log("Game is over, not switching turns");
          }
        }
      }, 1500);
    }, 2000);
  };

  const handleGuessSubmit = () => {
    if (!isCpuTurn && !gameOver) {
      handleGuess(userGuess);
    }
  };

  const handleSliderChange = (values) => {
    const value = values[0];
    const boundedValue = Math.max(minRange, Math.min(value, maxRange));
    setUserGuess(boundedValue.toString());
  };

  const handleBack = () => {
    resetGame();
    onBackToMenu();
  };

  const handleGuessWithCooldown = () => {
    if (isGuessButtonDisabled) return;

    setIsGuessButtonDisabled(true);
    handleGuessSubmit();

    setTimeout(() => {
      setIsGuessButtonDisabled(false);
    }, 2000);
  };

  const handleMuteToggle = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  // Effects
  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    let timerId;

    if (timerActive && !isCpuTurn && !gameOver && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    if (timeLeft === 0 && !isCpuTurn) {
      const randomGuess =
        Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;
      setUserGuess(randomGuess.toString());
      handleGuess(randomGuess);
      setTimeLeft(TURN_TIME_LIMIT);
      setTimerActive(false);
    }

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [timeLeft, timerActive, isCpuTurn, gameOver, minRange, maxRange]);

  useEffect(() => {
    setTimeLeft(TURN_TIME_LIMIT);
    setTimerActive(true);
  }, []);

  useEffect(() => {
    const newMultiplier =
      TURN_MULTIPLIERS[difficultyLevel][playerTurns] ||
      TURN_MULTIPLIERS[difficultyLevel][0];
    setCurrentMultiplier(newMultiplier);
  }, [playerTurns, difficultyLevel]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      {stage === "playing" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative w-[90vw] max-w-4xl mx-auto"
        >
          <div className="relative bg-black/50 backdrop-blur-sm border border-[#FFF5E4]/20 rounded-xl p-8 shadow-2xl">
            <GameHeader
              isMuted={isMuted}
              onMuteToggle={handleMuteToggle}
              onInfoOpen={() => setIsInfoOpen(true)}
            />

            <NumberRangeDisplay
              minRange={isCpuTurn ? "?" : minRange}
              maxRange={isCpuTurn ? "?" : maxRange}
            />

            <GameStats
              currentMultiplier={currentMultiplier}
              timeLeft={timeLeft}
              timerActive={timerActive}
            />
            <SliderSection
              userGuess={userGuess}
              minRange={minRange}
              maxRange={maxRange}
              rangeMax={rangeMax}
              onSliderChange={handleSliderChange}
              isGuessButtonDisabled={
                isGuessButtonDisabled || isCpuTurn || isGameEnding
              }
              loading={loading || isGameEnding}
              onGuessSubmit={handleGuessWithCooldown}
            />
          </div>

          {timerActive && !isCpuTurn && timeLeft <= 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute z-[100] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500 text-6xl font-bold"
            >
              {timeLeft}
            </motion.div>
          )}

          <AnimatePresence>
            {isCpuTurn && !gameOver && (
              <CPUTurnOverlay
                cpuState={cpuState}
                variants={cpuTurnVariants}
                feedbackVariants={feedbackVariants}
                isGameEnding={isGameEnding}
              />
            )}
          </AnimatePresence>

          {gameOver && (
            <div className="hidden">
              <GameOverModal
                hasWon={hasWon}
                turns={turns}
                MAX_TURNS={MAX_TURNS}
                multiplier={multiplier}
                secretNumber={secretNumber}
                finalPoints={finalPoints}
              />
            </div>
          )}
        </motion.div>
      )}

      {stage === "result" && (
        <ResultsScreen
          secretNumber={secretNumber}
          finalPoints={finalPoints}
          onBack={handleBack}
        />
      )}

      <InfoDialog
        isOpen={isInfoOpen}
        onOpenChange={setIsInfoOpen}
        TURN_MULTIPLIERS={TURN_MULTIPLIERS}
      />
    </div>
  );
};
export default GuessingGame;
