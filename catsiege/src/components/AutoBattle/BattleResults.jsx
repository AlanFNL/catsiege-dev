import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import BattleLog from "./BattleLog";
import { STATS } from "./constants";
import { gameService } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

// Mapping of stats to readable names and icons
const STAT_INFO = {
  [STATS.ATTACK]: { name: "Attack", icon: "⚔️" },
  [STATS.DEFENSE]: { name: "Defense", icon: "🛡️" },
  [STATS.HEALTH]: { name: "Health", icon: "❤️" },
  [STATS.SPEED]: { name: "Speed", icon: "⚡" },
  [STATS.CRITICAL]: { name: "Critical", icon: "🎯" },
  [STATS.EVASION]: { name: "Evasion", icon: "💨" },
};

const ENTRY_COST = 50;
const WIN_MULTIPLIER = 1.9;

const BattleResults = ({
  winner,
  playerItems,
  enemyItems,
  playerStats,
  enemyStats,
  battleLog,
  onPlayAgain,
  onBackToMenu,
  onBattleComplete,
}) => {
  const { user, setUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showReward, setShowReward] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [pointsUpdated, setPointsUpdated] = useState(false);

  // Calculate reward amount - do this outside of the useEffect for clarity
  const winnings =
    winner === "player" ? Math.floor(ENTRY_COST * WIN_MULTIPLIER) : 0;

  useEffect(() => {
    // Submit battle results to backend when component mounts
    const submitResults = async () => {
      if (isSubmitting) return;

      setIsSubmitting(true);

      try {
        // Set reward amount for display
        setRewardAmount(winnings);

        // Create a result object to pass to the API
        const battleResult = {
          winner,
          playerCharacter: {
            name: "Your Champion",
            stats: playerStats,
            items: playerItems,
          },
          enemyCharacter: {
            name: "Enemy Champion",
            stats: enemyStats,
            items: enemyItems,
          },
          battleLog,
          reward: winnings,
        };

        // Call API to complete battle and process rewards
        const response = await gameService.completeAutoBattle(battleResult);

        if (response && response.success) {
          // The server has already updated the points in the database
          // Just update the user state with the new points from the response
          if (response.currentPoints !== undefined) {
            setUser((prevUser) => ({
              ...prevUser,
              points: response.currentPoints,
            }));
            setPointsUpdated(true);
          }

          // Show reward animation if player won
          if (winner === "player") {
            // Short delay before showing reward animation
            setTimeout(() => {
              setShowReward(true);
            }, 1000);
          }
        } else {
          setError(response?.message || "Failed to record battle results");
        }
      } catch (err) {
        console.error("Error submitting battle results:", err);
        setError("An error occurred while recording battle results");
      } finally {
        setIsSubmitting(false);
      }
    };

    submitResults();
  }, [
    winner,
    playerItems,
    enemyItems,
    playerStats,
    enemyStats,
    battleLog,
    winnings,
    setUser,
  ]);

  // Helper function to render a stat with its icon
  const renderStat = (statKey, value, isEnemy = false) => {
    const info = STAT_INFO[statKey];

    return (
      <div
        key={statKey}
        className={`flex items-center gap-2 ${isEnemy ? "justify-end" : ""}`}
      >
        {!isEnemy && <span className="text-lg">{info.icon}</span>}
        <span className="text-[#FFF5E4]/80">{info.name}:</span>
        <span className="font-bold text-[#FFF5E4]">{value}</span>
        {isEnemy && <span className="text-lg">{info.icon}</span>}
      </div>
    );
  };

  // Helper function to render a single item
  const renderItem = (item, index, isEnemy = false) => {
    const delay = 0.1 + index * 0.1;

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className={`flex items-center gap-3 p-3 rounded-lg bg-[#1d1c19]/80 border border-[#FFF5E4]/10 ${
          isEnemy ? "flex-row-reverse" : ""
        }`}
      >
        <div className="w-10 h-10 bg-[#2a2924] rounded-lg flex items-center justify-center text-2xl">
          <span>{item.icon}</span>
        </div>
        <div className={`flex-1 ${isEnemy ? "text-right" : ""}`}>
          <h4 className={`font-bold ${item.rarity.color}`}>{item.name}</h4>
          <p className="text-xs text-[#FFF5E4]/60 capitalize">
            {item.type} • {item.rarity.name}
          </p>
        </div>
      </motion.div>
    );
  };

  const handlePlayAgain = () => {
    onPlayAgain();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center space-y-8 w-full max-w-6xl mx-auto"
    >
      {/* Battle outcome banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center w-full p-6 bg-gradient-to-r from-[#2a2924]/0 via-[#2a2924]/80 to-[#2a2924]/0 rounded-lg"
      >
        <h2 className="text-3xl font-bold mb-2">Battle Results</h2>
        <div
          className={`text-5xl font-bold my-4 ${
            winner === "player"
              ? "text-green-500"
              : winner === "enemy"
              ? "text-red-500"
              : "text-yellow-500"
          }`}
        >
          {winner === "player"
            ? "VICTORY!"
            : winner === "enemy"
            ? "DEFEAT!"
            : "DRAW!"}
        </div>

        {/* Points reward display */}
        {winner === "player" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: showReward ? 1 : 0,
              scale: showReward ? 1 : 0.8,
              y: showReward ? [0, -10, 0] : 0,
            }}
            transition={{
              duration: 0.6,
              y: { repeat: 3, repeatType: "mirror", duration: 1 },
            }}
            className="mt-2 mb-4"
          >
            <span className="text-lg text-[#FFF5E4]/80">Reward:</span>
            <div className="text-2xl font-bold text-[#FBE294]">
              +{rewardAmount} points
            </div>
            {!pointsUpdated && (
              <div className="text-xs text-[#FFF5E4]/60 mt-1">
                Points are being updated...
              </div>
            )}
          </motion.div>
        )}

        <p className="text-[#FFF5E4]/70">
          {winner === "player"
            ? "Your strategy and items led you to victory!"
            : winner === "enemy"
            ? "The enemy proved too powerful this time."
            : "Both combatants fought to a standstill!"}
        </p>

        {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
      </motion.div>

      {/* Stats and items comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        {/* Left column: Player stats and items */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">🐱</span>
            <h3 className="text-2xl font-bold text-[#FFF5E4]">Your Champion</h3>
          </div>

          {/* Player stats */}
          <div className="bg-[#2a2924]/60 rounded-lg p-4 border border-[#FFF5E4]/10">
            <h4 className="text-lg font-semibold mb-3 text-[#FBE294]">Stats</h4>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              {Object.entries(playerStats).map(([statKey, value]) =>
                renderStat(statKey, value)
              )}
            </div>
          </div>

          {/* Player items */}
          <div>
            <h4 className="text-lg font-semibold mb-3 text-[#FBE294]">
              Equipment
            </h4>
            <div className="space-y-3">
              {playerItems.map((item, index) => renderItem(item, index))}
            </div>
          </div>
        </motion.div>

        {/* Right column: Enemy stats and items */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-end gap-2 mb-4">
            <h3 className="text-2xl font-bold text-[#FFF5E4]">
              Enemy Champion
            </h3>
            <span className="text-3xl">🐰</span>
          </div>

          {/* Enemy stats */}
          <div className="bg-[#2a2924]/60 rounded-lg p-4 border border-[#FFF5E4]/10">
            <h4 className="text-lg font-semibold mb-3 text-[#FBE294] text-right">
              Stats
            </h4>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              {Object.entries(enemyStats).map(([statKey, value]) =>
                renderStat(statKey, value, true)
              )}
            </div>
          </div>

          {/* Enemy items */}
          <div>
            <h4 className="text-lg font-semibold mb-3 text-[#FBE294] text-right">
              Equipment
            </h4>
            <div className="space-y-3">
              {enemyItems.map((item, index) => renderItem(item, index, true))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Battle log (collapsed by default) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full"
      >
        <details className="w-full">
          <summary className="cursor-pointer py-2 px-4 bg-[#2a2924]/40 rounded-lg border border-[#FFF5E4]/10 text-[#FBE294] font-semibold">
            View Battle Log
          </summary>
          <div className="mt-4">
            <BattleLog battleLog={battleLog} />
          </div>
        </details>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex space-x-4 mt-8"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePlayAgain}
          className="bg-[#FBE294] text-[#1d1c19] px-6 py-3 rounded-lg font-bold"
        >
          PLAY AGAIN
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBackToMenu}
          className="bg-[#FFF5E4]/10 text-[#FFF5E4] px-6 py-3 rounded-lg font-bold"
        >
          BACK TO MENU
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default BattleResults;
