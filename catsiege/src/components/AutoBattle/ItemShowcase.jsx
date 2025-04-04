import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { STATS } from "./constants";

// Map stat keys to readable names and icons
const STAT_INFO = {
  [STATS.ATTACK]: { name: "Attack", icon: "⚔️" },
  [STATS.DEFENSE]: { name: "Defense", icon: "🛡️" },
  [STATS.HEALTH]: { name: "Health", icon: "❤️" },
  [STATS.SPEED]: { name: "Speed", icon: "⚡" },
  [STATS.CRITICAL]: { name: "Critical", icon: "🎯" },
  [STATS.EVASION]: { name: "Evasion", icon: "💨" },
};

const ItemShowcase = ({
  playerItems,
  enemyItems,
  isVisible,
  onComplete,
  playerStats,
  enemyStats,
}) => {
  if (!isVisible) return null;

  // Helper function to render a stat with its icon
  const renderStat = (statKey, value, isEnemy = false) => {
    const info = STAT_INFO[statKey];

    return (
      <div
        className={`flex items-center gap-2 ${isEnemy ? "justify-end" : ""}`}
      >
        {!isEnemy && <span className="text-lg">{info.icon}</span>}
        <span className="text-[#FFF5E4]/80">{info.name}:</span>
        <span
          className={`font-bold ${
            value > 0 ? "text-[#FFF5E4]" : "text-red-400"
          }`}
        >
          {value}
        </span>
        {isEnemy && <span className="text-lg">{info.icon}</span>}
      </div>
    );
  };

  // Helper function to render a single item
  const renderItem = (item, index, isEnemy = false) => {
    const delay = 0.1 + index * 0.1;

    // Generate a border color based on rarity
    const getRarityBorder = () => {
      switch (item.rarity.name) {
        case "Common":
          return "border-gray-400/40";
        case "Uncommon":
          return "border-green-500/40";
        case "Rare":
          return "border-blue-500/40";
        case "Epic":
          return "border-purple-500/40";
        case "Legendary":
          return "border-orange-400/60";
        default:
          return "border-gray-400/40";
      }
    };

    // Generate a glow based on rarity
    const getRarityGlow = () => {
      switch (item.rarity.name) {
        case "Common":
          return "";
        case "Uncommon":
          return "shadow-[0_0_8px_rgba(74,222,128,0.2)]";
        case "Rare":
          return "shadow-[0_0_8px_rgba(59,130,246,0.3)]";
        case "Epic":
          return "shadow-[0_0_10px_rgba(168,85,247,0.4)]";
        case "Legendary":
          return "shadow-[0_0_15px_rgba(249,115,22,0.5)]";
        default:
          return "";
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className={`flex items-center gap-3 p-3 rounded-lg bg-[#1d1c19]/80 border ${getRarityBorder()} ${getRarityGlow()} ${
          isEnemy ? "flex-row-reverse" : ""
        }`}
      >
        <div
          className={`w-10 h-10 bg-[#2a2924] rounded-lg flex items-center justify-center text-2xl ${
            item.rarity.name === "Legendary" ? "animate-pulse" : ""
          }`}
        >
          <span>{item.icon}</span>
        </div>
        <div className={`flex-1 ${isEnemy ? "text-right" : ""}`}>
          <h4 className={`font-bold ${item.rarity.color}`}>{item.name}</h4>
          <p className="text-xs text-[#FFF5E4]/60 capitalize">
            {item.type} • {item.rarity.name}
          </p>
          <div
            className={`grid grid-cols-2 gap-x-2 mt-2 ${
              isEnemy ? "text-right" : ""
            }`}
          >
            {Object.entries(item.stats).map(([stat, value]) => (
              <div
                key={stat}
                className={`flex items-center gap-1 text-xs ${
                  isEnemy ? "justify-end" : ""
                }`}
              >
                <span className="text-[#FFF5E4]/70">
                  {STAT_INFO[stat].name}:
                </span>
                <span className={value > 0 ? "text-green-400" : "text-red-400"}>
                  {value > 0 ? `+${value}` : value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#2a2924]/90 backdrop-blur-md p-6 rounded-xl border-2 border-[#FFF5E4]/20 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center w-full p-6 bg-gradient-to-r from-[#2a2924]/0 via-[#2a2924]/80 to-[#2a2924]/0 rounded-lg mb-8 relative overflow-hidden"
          >
            {/* Animated background elements */}
            <motion.div
              className="absolute inset-0 z-0 opacity-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-2xl"
                animate={{
                  x: [0, 10, 0],
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
              <motion.div
                className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"
                animate={{
                  x: [0, -10, 0],
                  y: [0, 5, 0],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            </motion.div>

            {/* Title with golden gradient effect */}
            <h2 className="text-4xl font-bold mb-2 relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-[#FBE294] to-yellow-200 drop-shadow-[0_0_2px_rgba(251,226,148,0.3)]">
              Battle Preparation
            </h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-[#FFF5E4]/80 mt-2 relative z-10"
            >
              Review the items and stats that will determine your fate
            </motion.p>

            {/* Decorative elements */}
            <div className="flex justify-center mt-4">
              <motion.div
                className="h-px w-32 bg-gradient-to-r from-transparent via-[#FBE294]/50 to-transparent"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 128, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              />
            </div>
          </motion.div>

          {/* Stats and items comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full mb-8">
            {/* Left column: Player stats and items */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">🐱</span>
                <h3 className="text-2xl font-bold text-[#FFF5E4]">
                  Your Champion
                </h3>
              </div>

              {/* Player stats */}
              <div className="bg-[#2a2924]/60 rounded-lg p-4 border border-[#FFF5E4]/10">
                <h4 className="text-lg font-semibold mb-3 text-[#FBE294]">
                  Stats
                </h4>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  {playerStats &&
                    Object.entries(playerStats).map(([statKey, value]) =>
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
                  {enemyStats &&
                    Object.entries(enemyStats).map(([statKey, value]) =>
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
                  {enemyItems.map((item, index) =>
                    renderItem(item, index, true)
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mt-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="px-8 py-3 bg-[#FBE294] text-[#1d1c19] rounded-lg font-bold"
            >
              PROCEED TO BATTLE
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ItemShowcase;
