import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Import sound effects
import hitSound from "../assets/hit.mp3";
import missSound from "../assets/miss.mp3";
import battleMusic from "../assets/battle-music.mp3";

import WinnerDisplay from "./WinnerDisplay";
import TournamentSocket from "./TournamentSocket";
import CoinFlipDisplay from "./animations/CoinFlipDisplay";
import DiceRollDisplay from "./animations/DiceRollDisplay";
import HitRollDisplay from "./animations/HitRollDisplay";
import BattleCard from "./BattleCard";
import tournbg from "../assets/tourn-bg.webp";

// Add sound management
function useSoundSystem() {
  const sounds = useRef({
    hit: new Audio(hitSound),
    miss: new Audio(missSound),
    bgm: new Audio(battleMusic),
  }).current;

  useEffect(() => {
    // Configure background music
    sounds.bgm.loop = true;
    sounds.bgm.volume = 0.3; // Adjust volume as needed

    // Configure sound effects
    sounds.hit.volume = 0.1;
    sounds.miss.volume = 0.4;

    return () => {
      // Cleanup sounds on unmount
      Object.values(sounds).forEach((sound) => {
        sound.pause();
        sound.currentTime = 0;
      });
    };
  }, []);

  const playSound = (soundName) => {
    const sound = sounds[soundName];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch((err) => console.log("Audio play failed:", err));
    }
  };

  const toggleBGM = (shouldPlay) => {
    if (shouldPlay) {
      sounds.bgm.play().catch((err) => console.log("BGM play failed:", err));
    } else {
      sounds.bgm.pause();
      sounds.bgm.currentTime = 0;
    }
  };

  return { playSound, toggleBGM };
}

function Tournament() {
  // Initialize socket ref first
  const socketRef = useRef(null);

  // Initialize all state variables
  const [tournamentState, setTournamentState] = useState({
    currentRound: 0,
    brackets: [],
    currentMatch: null,
    winners: [],
    isRunning: false,
    roundSizes: [512, 256, 128, 64, 32, 16, 8, 4, 2, 1],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coinFlipResult, setCoinFlipResult] = useState(null);
  const [battleState, setBattleState] = useState({
    nft1: null,
    nft2: null,
    currentAttacker: null,
  });
  const [hitInfo, setHitInfo] = useState(null);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [battleKey, setBattleKey] = useState(0);
  const [hitRollInfo, setHitRollInfo] = useState(null);
  const [featuredBattle, setFeaturedBattle] = useState(null);
  const [diceRollInfo, setDiceRollInfo] = useState(null);
  const [winner, setWinner] = useState(null);
  const [hasAttemptedInitialFetch, setHasAttemptedInitialFetch] =
    useState(false);
  const [shouldShowBattle, setShouldShowBattle] = useState(false);
  const [showWinner, setShowWinner] = useState(false);

  const [tournamentStats, setTournamentStats] = useState({
    currentRound: 0,
    totalRounds: 0,
    matchesCompleted: 0,
    totalMatchesInRound: 0,
    playersLeft: 0,
    roundProgress: 0,
  });

  const currentRoundRef = useRef(null);
  const { playSound, toggleBGM } = useSoundSystem();

  const [showSecretButton, setShowSecretButton] = useState(false);
  const [secretCode, setSecretCode] = useState("");

  // Add keyboard listener
  useEffect(() => {
    const handleKeyPress = (e) => {
      setSecretCode((prev) => {
        const newCode = (prev + e.key).slice(-11); // Keep last 11 characters
        if (newCode === "catsiege123") {
          setShowSecretButton(true);
          // Hide button after 5 seconds
          setTimeout(() => setShowSecretButton(false), 5000);
          return "";
        }
        return newCode;
      });
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Define all handlers
  const handleBattleUpdate = React.useCallback((data) => {
    if (data.isFeatured) {
      setBattleState({
        nft1: {
          ...data.nft1,
          health: data.nft1.battleHealth?.nft1 || data.nft1.health,
        },
        nft2: {
          ...data.nft2,
          health: data.nft2.battleHealth?.nft2 || data.nft2.health,
        },
        currentAttacker: data.currentAttacker,
      });
      const sawWinner = localStorage.getItem("seenWinner");
      // Check for winner in battle update
      if (data.winner && !sawWinner) {
        setWinner(data.winner);
      }
    }
  }, []);

  const handleHitRoll = React.useCallback((data) => {
    // Properly structure the hit roll data
    if (data) {
      setHitRollInfo({
        attacker: data.attacker || data.roll?.attacker,
        defender: data.defender || data.roll?.defender,
        roll: typeof data.roll === "number" ? data.roll : data.roll?.value,
        required: data.required || data.roll?.required || 4, // default value if not provided
      });

      // Clear hit roll info after animation
      setTimeout(() => {
        setHitRollInfo(null);
      }, 2000);
    }
  }, []);

  const handleNftHit = React.useCallback((data) => {
    if (data.isFeatured) {
      // Update hit info with complete data
      setHitInfo({
        attacker: data.attacker,
        defender: data.target || data.defender,
        damage: data.damage,
        timestamp: Date.now(),
      });

      // Update battle state to reflect new health values and current attacker
      setBattleState((prevState) => ({
        ...prevState,
        nft1: {
          ...prevState.nft1,
          health: data.health?.nft1 || prevState.nft1.health,
        },
        nft2: {
          ...prevState.nft2,
          health: data.health?.nft2 || prevState.nft2.health,
        },
        currentAttacker: data.attacker,
      }));

      // Clear hit info after animation
      setTimeout(() => {
        setHitInfo(null);
      }, 2000);
    }
  }, []);

  const handleCoinFlip = React.useCallback((data) => {
    if (data) {
      setCoinFlipResult({
        result: data.result,
        nft1: data.nft1,
        nft2: data.nft2,
        winner: data.winner,
      });

      // Clear coin flip after animation
      setTimeout(() => {
        setCoinFlipResult(null);
      }, 3000);
    }
  }, []);

  const handleFeaturedBattle = React.useCallback((battle) => {
    if (battle.isFeatured) {
      setFeaturedBattle(battle);
      // Also update battle state when receiving a new featured battle
      setBattleState({
        nft1: battle.nft1,
        nft2: battle.nft2,
      });
      setBattleKey((prev) => prev + 1);
    }
  }, []);

  const handleTournamentState = React.useCallback((state) => {
    if (state) {
      setTournamentState((prevState) => ({
        ...prevState,
        currentRound: state.currentRound || 0,
        brackets: state.brackets || [],
        currentMatch: state.currentMatch,
        winners: state.winners || [],
        isRunning: state.isRunning || false,
        roundSizes: state.roundSizes || [512, 256, 128, 64, 32, 16, 8, 4, 2, 1],
      }));

      const sawWinner = localStorage.getItem("seenWinner");

      // Check for winner in tournament state
      if (state.winners?.length > 0 && !sawWinner) {
        setWinner(state.winners[0]);
      }

      // Update tournament stats with more detailed information
      setTournamentStats((prevStats) => ({
        currentRound: state.stats?.currentRound || 0,
        totalRounds: state.stats?.totalRounds || 10,
        matchesCompleted: state.stats?.matchesCompleted || 0,
        totalMatchesInRound: state.stats?.totalMatchesInRound || 0,
        playersLeft: state.stats?.playersLeft || 0,
        roundProgress: state.stats?.roundProgress || 0,
        isFinalRound: state.stats?.playersLeft === 2,
      }));

      setIsLoading(false);
    }
  }, []);

  // Add effect to request initial state
  useEffect(() => {
    if (!hasAttemptedInitialFetch && socketRef.current) {
      socketRef.current.emit("requestTournamentState");
      setHasAttemptedInitialFetch(true);
    }
  }, [hasAttemptedInitialFetch]);

  const handleInitializeTournament = () => {
    if (socketRef.current) {
      socketRef.current.emit("initializeTournament");
    } else {
      console.error("Socket not connected");
    }
  };

  // Add this handler if it's missing
  const handleImageLoad = (image) => {
    setLoadedImages((prev) => new Set(prev).add(image));
  };

  // Update the dice roll handler
  const handleDiceRoll = React.useCallback((data) => {
    if (data && data.attacker && data.defender) {
      setDiceRollInfo(data);
      // Clear dice roll info after animation
      setTimeout(() => {
        setDiceRollInfo(null);
      }, 2000);
    }
  }, []);

  // Add handler to close winner display if needed
  const handleCloseWinner = () => {
    setWinner(null);

    localStorage.setItem("seenWinner", "true");
  };

  // Add handleError callback
  const handleError = React.useCallback((error) => {
    setError(error);
    setIsLoading(false);
  }, []);

  // Add this effect to handle tournament completion
  useEffect(() => {
    if (tournamentState && tournamentStats) {
      const isRunning = tournamentState.isRunning;
      const isLastRound =
        tournamentStats.currentRound === tournamentStats.totalRounds;
      const isFinalBattle = tournamentStats.playersLeft === 2;
      const hasWinner = tournamentState.winners?.length > 0;
      const sawWinner = localStorage.getItem("seenWinner");
      // Check for tournament completion
      if (
        isRunning &&
        isLastRound &&
        isFinalBattle &&
        hasWinner &&
        !sawWinner
      ) {
        setWinner(tournamentState.winners[0]);

        // Emit tournament completion event
        if (socketRef.current) {
          socketRef.current.emit("tournamentComplete", {
            winner: tournamentState.winners[0],
          });
        }
      }
    }
  }, [tournamentState, tournamentStats]);

  // Add handler for tournament completion
  const handleTournamentComplete = React.useCallback((data) => {
    if (data.winner) {
      setWinner(data.winner);
      setShowWinner(true);
    }
  }, []);

  return (
    <div className="relative">
      <TournamentSocket
        socketRef={socketRef}
        onBattleUpdate={handleBattleUpdate}
        onHitRoll={handleHitRoll}
        onNftHit={handleNftHit}
        onCoinFlip={handleCoinFlip}
        onDiceRoll={handleDiceRoll}
        onFeaturedBattle={handleFeaturedBattle}
        onTournamentState={handleTournamentState}
        onTournamentComplete={handleTournamentComplete}
        onError={handleError}
        requestInitialState={true}
      >
        {/* Main container with responsive padding */}
        <div className="relative min-h-screen bg-gray-900 p-3 sm:p-4 md:p-6">
          <div className="absolute inset-0 w-full h-full">
            <img
              src={tournbg}
              className="w-full h-full object-cover"
              style={{
                filter: "brightness(0.4)",
                willChange: "transform", // Optimization hint
              }}
            ></img>
          </div>
          <AnimatePresence>
            {showSecretButton && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-4 right-4 z-50"
              >
                <motion.button
                  onClick={handleInitializeTournament}
                  className="px-4 py-2 bg-red-500/50 hover:bg-red-500/70 
                       text-white rounded-lg border border-red-400/30
                       text-sm font-mono shadow-lg backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Initialize Tournament
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
          ;{/* Responsive grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[300px_1fr_300px] gap-4 md:gap-6 h-full">
            {/* Left column - Tournament Stats */}
            {tournamentState.isRunning && (
              <div className="md:col-span-1 lg:col-span-1">
                <TournamentStatus
                  stats={tournamentStats}
                  battleState={battleState}
                  toggleBGM={toggleBGM}
                  currentMatches={tournamentState.currentMatches}
                />
              </div>
            )}

            {/* Middle column - Battle Cards */}
            <div className="md:col-span-2 lg:col-span-1 flex items-center justify-center min-h-[400px] md:min-h-[600px]">
              {tournamentState.isRunning && featuredBattle && (
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-center">
                  <BattleCard
                    key={`${battleKey}-1`}
                    nft={battleState.nft1 || featuredBattle.nft1}
                    isAttacker={
                      hitInfo?.attacker?.id ===
                      (battleState.nft1?.id || featuredBattle.nft1?.id)
                    }
                    hitInfo={hitInfo}
                    battleKey={battleKey}
                    onImageLoad={handleImageLoad}
                    showVideo={false}
                    playSound={playSound}
                  />
                  <div className="text-xl sm:text-2xl text-purple-500 font-bold z-[5]">
                    VS
                  </div>
                  <BattleCard
                    key={`${battleKey}-2`}
                    nft={battleState.nft2 || featuredBattle.nft2}
                    isAttacker={
                      hitRollInfo?.attacker?.id ===
                      (battleState.nft2?.id || featuredBattle.nft2?.id)
                    }
                    hitInfo={hitInfo}
                    battleKey={battleKey}
                    onImageLoad={handleImageLoad}
                    showVideo={false}
                    playSound={playSound}
                  />
                </div>
              )}
            </div>

            {/* Right column - Battle Rules */}
            {tournamentState.isRunning && (
              <div className="md:col-span-1 lg:col-span-1">
                <BattleRules />
              </div>
            )}
          </div>
          {/* Tournament Progress at bottom */}
          {tournamentState.isRunning && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4">
              <TournamentProgress stats={tournamentStats} />
            </div>
          )}
          {/* Animation overlays with responsive positioning */}
          <div className="fixed inset-0 pointer-events-none z-[100]">
            <AnimatePresence>
              {coinFlipResult && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <CoinFlipDisplay
                    result={coinFlipResult.result}
                    nft1={coinFlipResult.nft1}
                    nft2={coinFlipResult.nft2}
                    winner={coinFlipResult.winner}
                  />
                </div>
              )}
              {diceRollInfo && <DiceRollDisplay roll={diceRollInfo} />}
              {hitRollInfo && <HitRollDisplay roll={hitRollInfo} />}
            </AnimatePresence>
          </div>
          {/* Winner Display - Move outside other animation containers */}
          <AnimatePresence mode="wait">
            {winner && (
              <div className="fixed inset-0 z-50">
                <WinnerDisplay winner={winner} onClose={handleCloseWinner} />
              </div>
            )}
          </AnimatePresence>
        </div>
      </TournamentSocket>

      {/* Error display */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 
                     bg-red-500/90 text-white px-4 py-2 rounded-lg z-50"
        >
          {error.message || "An error occurred"}
        </motion.div>
      )}
    </div>
  );
}

// Update BattleRules component to be responsive
const BattleRules = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-3 sm:p-4 md:p-6 rounded-lg border border-gray-700 bg-black/60 backdrop-blur-sm w-full"
  >
    <h3 className="text-base lg:text-lg font-bold text-gray-200 mb-2 md:mb-4">
      ⚔️ Battle Rules
    </h3>
    <div className="text-xs sm:text-sm text-gray-300 space-y-2 md:space-y-3">
      <p className="flex items-center gap-3">
        <span className="text-purple-400">❤️</span>
        <span>Each NFT starts with 32 HP</span>
      </p>
      <p className="flex items-center gap-3">
        <span className="text-purple-400">🎲</span>
        <span>Coin flip determines who attacks first</span>
      </p>
      <p className="flex items-center gap-3">
        <span className="text-purple-400">🎯</span>
        <span>Attack rolls need 11 or higher to hit</span>
      </p>
      <p className="flex items-center gap-3">
        <span className="text-purple-400">⚔️</span>
        <span>First to reduce opponent's HP to 0 wins</span>
      </p>
    </div>
  </motion.div>
);

// Update TournamentStatus component to be responsive
const TournamentStatus = ({
  stats,
  battleState,
  toggleBGM,
  currentMatches,
}) => {
  const [isMuted, setIsMuted] = useState(true);

  const handleToggleAudio = () => {
    setIsMuted(!isMuted);
    toggleBGM(!isMuted);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-3 sm:p-4 md:p-6 rounded-lg border border-gray-700 bg-black/80 backdrop-blur-sm
                 h-auto w-full"
    >
      <h3 className="text-base lg:text-lg font-bold text-gray-200 mb-3 lg:mb-4">
        🏆 Tournament Status
      </h3>
      <div className="space-y-2 lg:space-y-3 text-xs lg:text-sm text-gray-300">
        {/* Round Info */}
        <div className="flex justify-between items-center">
          <span>Current Round</span>
          <span className="text-purple-400 font-mono">
            {stats?.currentRound || 0}/{stats?.totalRounds || 0}
          </span>
        </div>

        {/* Current Featured Match Info */}
        <div className="border-t border-gray-800 my-4" />
        <div className="text-xs">
          <div className="text-gray-500 mb-2">Featured Battle</div>
          <div className="font-medium text-purple-400">
            {battleState.nft1?.name || "---"}
            <span className="text-gray-600 mx-2">vs</span>
            {battleState.nft2?.name || "---"}
          </div>
        </div>

        {/* Audio Controls */}
        <div className="border-t border-gray-800 mt-4 pt-4">
          <motion.button
            onClick={handleToggleAudio}
            className="flex items-center gap-2 px-3 py-2 rounded-lg 
                     bg-purple-600/20 hover:bg-purple-600/30 
                     border border-purple-500/30 w-full
                     transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-lg">{isMuted ? "🔇" : "🔊"}</span>
            <span className="text-xs text-purple-300">
              {isMuted ? "Enable Sound" : "Disable Sound"}
            </span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Update TournamentProgress to include debug info
const TournamentProgress = ({ stats }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6  md:left-1/2 transform -translate-x-1/2 
                 bg-gray-900/90 backdrop-blur-sm p-4 rounded-xl border border-gray-800
                 text-white shadow-lg z-50"
    >
      <div className="text-center space-y-3">
        <div className="text-sm text-gray-400">
          Round {stats.currentRound} of {stats.totalRounds}
        </div>

        {/* Progress bar */}
        <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.roundProgress}%` }}
            className="h-full bg-purple-500"
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="flex justify-between text-sm">
          <div>
            <span className="text-purple-400">{stats.matchesCompleted}</span>
            <span className="text-gray-500">
              {" "}
              / {stats.totalMatchesInRound}
            </span>
            <span className="text-gray-400"> matches</span>
          </div>
          <div>
            <span className="text-blue-400">{stats.playersLeft}</span>
            <span className="text-gray-400"> players left</span>
          </div>
        </div>

        {stats.roundProgress > 90 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-yellow-400"
          >
            Next round starting soon...
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Update the DevControls component

export default Tournament;
