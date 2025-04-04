import React from "react";
import { motion } from "framer-motion";

const BattleLogCard = ({ log, index, totalLogs }) => {
  // Determine card type and extract data
  const getCardType = () => {
    if (log.includes("CRITICAL") && log.includes("Player lands")) {
      return {
        type: "player-critical",
        icon: "⚡",
        character: "🐱",
        color: "yellow",
      };
    } else if (log.includes("CRITICAL") && log.includes("Enemy lands")) {
      return {
        type: "enemy-critical",
        icon: "⚡",
        character: "🐰",
        color: "yellow",
      };
    } else if (log.includes("Player attacks")) {
      return {
        type: "player-attack",
        icon: "⚔️",
        character: "🐱",
        color: "white",
      };
    } else if (log.includes("Enemy attacks")) {
      return {
        type: "enemy-attack",
        icon: "⚔️",
        character: "🐰",
        color: "white",
      };
    } else if (log.includes("Player evaded")) {
      return {
        type: "player-evade",
        icon: "💨",
        character: "🐱",
        color: "blue",
      };
    } else if (log.includes("Enemy evaded")) {
      return {
        type: "enemy-evade",
        icon: "💨",
        character: "🐰",
        color: "blue",
      };
    } else if (log.includes("VICTORY")) {
      return {
        type: "victory",
        icon: "🏆",
        character: "🐱",
        color: "green",
      };
    } else if (log.includes("DEFEAT")) {
      return {
        type: "defeat",
        icon: "💀",
        character: "🐰",
        color: "red",
      };
    } else if (log.includes("Turn")) {
      return {
        type: "turn",
        icon: "🔄",
        color: "gold",
        turn: log.match(/Turn (\d+)/)?.[1] || "",
      };
    } else if (log.includes("initiative") && log.includes("Player")) {
      return {
        type: "player-initiative",
        icon: "🎲",
        character: "🐱",
        color: "purple",
      };
    } else if (log.includes("initiative") && log.includes("Enemy")) {
      return {
        type: "enemy-initiative",
        icon: "🎲",
        character: "🐰",
        color: "purple",
      };
    } else if (log.includes("battle begins")) {
      return {
        type: "battle-start",
        icon: "⚔️",
        color: "gold",
      };
    } else if (log.includes("Player's health:")) {
      const health = log.split("Player's health: ")[1];
      return {
        type: "player-health",
        icon: "❤️",
        character: "🐱",
        color: "red",
        health,
      };
    } else if (log.includes("Enemy's health:")) {
      const health = log.split("Enemy's health: ")[1];
      return {
        type: "enemy-health",
        icon: "❤️",
        character: "🐰",
        color: "red",
        health,
      };
    }
    return {
      type: "default",
      icon: "📝",
      color: "white",
    };
  };

  // Get appropriate colors based on card type
  const getCardColors = (type) => {
    switch (type.color) {
      case "yellow":
        return "bg-yellow-900/30 border-yellow-500/30 text-yellow-400";
      case "blue":
        return "bg-blue-900/30 border-blue-500/30 text-blue-400";
      case "green":
        return "bg-green-900/30 border-green-500/30 text-green-400";
      case "red":
        return "bg-red-900/30 border-red-500/30 text-red-400";
      case "purple":
        return "bg-purple-900/30 border-purple-500/30 text-purple-400";
      case "gold":
        return "bg-amber-900/30 border-amber-500/30 text-[#FBE294]";
      default:
        return "bg-[#1d1c19] border-[#FFF5E4]/20 text-[#FFF5E4]/80";
    }
  };

  // Determine if this is a health update that should be displayed differently
  const isHealthUpdate = log.includes("health:") && !log.includes("The battle");

  // Skip some entries that are redundant or less important
  if (
    log === "The battle begins..." ||
    (isHealthUpdate && index > 0 && index < totalLogs - 1)
  ) {
    return null;
  }

  const cardType = getCardType();
  const cardColors = getCardColors(cardType);

  // Calculate animation delay based on index, but cap it to avoid too much delay
  const animationDelay = Math.min(index * 0.05, 0.5);

  // For health updates, combine them with the previous attack when possible
  if (isHealthUpdate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: animationDelay, duration: 0.3 }}
        className={`px-3 py-1 rounded-md border ${cardColors} text-sm my-1`}
      >
        <div className="flex items-center gap-1.5">
          <span>{cardType.character}</span>
          <span>{cardType.icon}</span>
          <span className="font-medium">{cardType.health}</span>
        </div>
      </motion.div>
    );
  }

  // Special formatting for turn indicators
  if (cardType.type === "turn") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: animationDelay, duration: 0.3 }}
        className={`px-3 py-1 rounded-md border ${cardColors} text-sm font-semibold w-full my-1`}
      >
        <div className="flex items-center gap-2">
          <span>{cardType.icon}</span>
          <span>Turn {cardType.turn}</span>
        </div>
      </motion.div>
    );
  }

  // For battle start
  if (cardType.type === "battle-start") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: animationDelay, duration: 0.3 }}
        className={`px-3 py-1 rounded-md border ${cardColors} text-sm font-semibold w-full my-1`}
      >
        <div className="flex items-center gap-2">
          <span>{cardType.icon}</span>
          <span>Battle Begins</span>
        </div>
      </motion.div>
    );
  }

  // For victory or defeat
  if (cardType.type === "victory" || cardType.type === "defeat") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: animationDelay, duration: 0.3 }}
        className={`px-3 py-1 rounded-md border ${cardColors} text-sm font-bold w-full my-1`}
      >
        <div className="flex items-center gap-2">
          <span>{cardType.icon}</span>
          <span>{cardType.type === "victory" ? "Victory!" : "Defeat!"}</span>
        </div>
      </motion.div>
    );
  }

  // Standard action card
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.3 }}
      className={`px-3 py-1 rounded-md border ${cardColors} text-sm my-1`}
    >
      <div className="flex items-center gap-1.5">
        {cardType.character && <span>{cardType.character}</span>}
        <span>{cardType.icon}</span>
        <span>{getLogText(log, cardType)}</span>
      </div>
    </motion.div>
  );
};

// Extract the most relevant part of the log text
const getLogText = (log, cardType) => {
  if (cardType.type.includes("attack")) {
    const damage = log.match(/for (\d+) damage/);
    return damage ? `Deals ${damage[1]} damage` : "Attacks";
  }

  if (cardType.type.includes("evade")) {
    return "Evaded attack";
  }

  if (cardType.type.includes("initiative")) {
    return "Goes first";
  }

  // Default: return a condensed version of the log
  const condensed = log.length > 40 ? log.substring(0, 40) + "..." : log;
  return condensed;
};

export default BattleLogCard;
