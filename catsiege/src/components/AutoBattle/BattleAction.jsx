import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const BattleAction = ({
  action,
  isVisible,
  key,
  nextAction = null,
  duration = 1.5,
}) => {
  if (!action || !isVisible) return null;

  // Get action type and any additional data
  const getActionType = () => {
    if (action.includes("CRITICAL") && action.includes("Player lands")) {
      return { type: "player-critical", damage: extractDamage(action) };
    } else if (action.includes("CRITICAL") && action.includes("Enemy lands")) {
      return { type: "enemy-critical", damage: extractDamage(action) };
    } else if (action.includes("Player attacks")) {
      return { type: "player-attack", damage: extractDamage(action) };
    } else if (action.includes("Enemy attacks")) {
      return { type: "enemy-attack", damage: extractDamage(action) };
    } else if (action.includes("Player evaded")) {
      return { type: "player-evade" };
    } else if (action.includes("Enemy evaded")) {
      return { type: "enemy-evade" };
    } else if (action.includes("VICTORY")) {
      return { type: "victory" };
    } else if (action.includes("DEFEAT")) {
      return { type: "defeat" };
    } else if (action.includes("Turn")) {
      return { type: "turn", turn: action.match(/Turn (\d+)/)?.[1] || "" };
    } else if (action.includes("initiative") && action.includes("Player")) {
      return { type: "player-initiative" };
    } else if (action.includes("initiative") && action.includes("Enemy")) {
      return { type: "enemy-initiative" };
    } else if (action.includes("battle begins")) {
      return { type: "battle-start" };
    } else if (action.includes("health:") && action.includes("Player")) {
      return { type: "player-health", health: extractHealth(action) };
    } else if (action.includes("health:") && action.includes("Enemy")) {
      return { type: "enemy-health", health: extractHealth(action) };
    }
    return { type: "default" };
  };

  // Get next action type preview (if any)
  const getNextActionType = () => {
    if (!nextAction) return null;

    if (
      nextAction.includes("Player attacks") ||
      nextAction.includes("Player lands a CRITICAL")
    ) {
      return { type: "player-attack", preview: "Player Attack" };
    } else if (
      nextAction.includes("Enemy attacks") ||
      nextAction.includes("Enemy lands a CRITICAL")
    ) {
      return { type: "enemy-attack", preview: "Enemy Attack" };
    } else if (nextAction.includes("Turn")) {
      const turn = nextAction.match(/Turn (\d+)/)?.[1] || "";
      return { type: "turn", preview: `Turn ${turn}` };
    }

    return null;
  };

  // Extract damage amount from attack action
  const extractDamage = (text) => {
    // Check for different formats of damage messages
    let match = text.match(/for (\d+) damage/);
    if (!match) {
      match = text.match(/attacks for (\d+) damage/);
    }
    if (!match) {
      // Fallback regex to try to find any number after "attack" or "attacks"
      match = text.match(/attacks?.*?(\d+)/);
    }

    // Debug log to help diagnose issues
    if (!match) {
      console.log("Failed to extract damage from:", text);
    }

    return match ? match[1] : "";
  };

  // Extract health amount from health action
  const extractHealth = (text) => {
    const match = text.match(/health: (\d+)/);
    return match ? match[1] : "";
  };

  // Get appropriate icon and style based on action type
  const renderActionContent = () => {
    const actionType = getActionType();

    switch (actionType.type) {
      case "player-attack":
        return (
          <div className="flex items-center gap-3">
            <span className="text-2xl">🐱</span>
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-xl mr-2">⚔️</span>
                <span className="font-bold text-[#FFF5E4]">Attack</span>
              </div>
              <span className="text-[#FFF5E4]/80 text-sm">
                Deals {actionType.damage} damage
              </span>
            </div>
          </div>
        );

      case "enemy-attack":
        return (
          <div className="flex items-center gap-3">
            <span className="text-2xl">🐰</span>
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-xl mr-2">⚔️</span>
                <span className="font-bold text-[#FFF5E4]">Attack</span>
              </div>
              <span className="text-[#FFF5E4]/80 text-sm">
                Deals {actionType.damage} damage
              </span>
            </div>
          </div>
        );

      case "player-critical":
        return (
          <div className="flex items-center gap-3">
            <span className="text-2xl">🐱</span>
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-xl mr-2">⚡</span>
                <span className="font-bold text-yellow-400">CRITICAL HIT!</span>
              </div>
              <span className="text-yellow-200 text-sm">
                Deals {actionType.damage} damage
              </span>
            </div>
          </div>
        );

      case "enemy-critical":
        return (
          <div className="flex items-center gap-3">
            <span className="text-2xl">🐰</span>
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-xl mr-2">⚡</span>
                <span className="font-bold text-yellow-400">CRITICAL HIT!</span>
              </div>
              <span className="text-yellow-200 text-sm">
                Deals {actionType.damage} damage
              </span>
            </div>
          </div>
        );

      case "player-evade":
        return (
          <div className="flex items-center gap-3">
            <span className="text-2xl">🐱</span>
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-xl mr-2">💨</span>
                <span className="font-bold text-blue-400">EVADED</span>
              </div>
              <span className="text-blue-300 text-sm">Attack missed!</span>
            </div>
          </div>
        );

      case "enemy-evade":
        return (
          <div className="flex items-center gap-3">
            <span className="text-2xl">🐰</span>
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-xl mr-2">💨</span>
                <span className="font-bold text-blue-400">EVADED</span>
              </div>
              <span className="text-blue-300 text-sm">Attack missed!</span>
            </div>
          </div>
        );

      case "victory":
        return (
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <span className="font-bold text-green-400 text-xl">VICTORY!</span>
          </div>
        );

      case "defeat":
        return (
          <div className="flex items-center gap-3">
            <span className="text-3xl">💀</span>
            <span className="font-bold text-red-400 text-xl">DEFEAT!</span>
          </div>
        );

      case "turn":
        return (
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔄</span>
            <span className="font-bold text-[#FBE294]">
              Turn {actionType.turn}
            </span>
          </div>
        );

      case "player-initiative":
        return (
          <div className="flex items-center gap-3">
            <span className="text-2xl">🐱</span>
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-xl mr-2">🎲</span>
                <span className="font-bold text-purple-400">Initiative</span>
              </div>
              <span className="text-purple-300 text-sm">Player goes first</span>
            </div>
          </div>
        );

      case "enemy-initiative":
        return (
          <div className="flex items-center gap-3">
            <span className="text-2xl">🐰</span>
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-xl mr-2">🎲</span>
                <span className="font-bold text-purple-400">Initiative</span>
              </div>
              <span className="text-purple-300 text-sm">Enemy goes first</span>
            </div>
          </div>
        );

      case "battle-start":
        return (
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚔️</span>
            <span className="font-bold text-[#FBE294] text-xl">
              Battle Begins!
            </span>
          </div>
        );

      case "player-health":
      case "enemy-health":
        // Don't show health updates as an action
        return null;

      default:
        return <div className="text-[#FFF5E4]">{action}</div>;
    }
  };

  // Skip rendering for health updates
  const actionType = getActionType();
  if (
    actionType.type === "player-health" ||
    actionType.type === "enemy-health"
  ) {
    return null;
  }

  // Get animation variants based on action type
  const getAnimationVariants = () => {
    const actionType = getActionType();

    // Basic fade and slide animation (default)
    const baseVariants = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    };

    // Special animations for different action types
    switch (actionType.type) {
      case "player-critical":
      case "enemy-critical":
        return {
          initial: { opacity: 0, scale: 0.7, rotate: -5 },
          animate: {
            opacity: 1,
            scale: [0.7, 1.1, 1],
            rotate: [-5, 5, 0],
            transition: {
              duration: 0.5,
              times: [0, 0.6, 1],
            },
          },
          exit: {
            opacity: 0,
            scale: 0.7,
            rotate: 5,
            transition: { duration: 0.3 },
          },
        };

      case "player-evade":
      case "enemy-evade":
        return {
          initial: { opacity: 0, x: -30 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 30 },
        };

      case "victory":
        return {
          initial: { opacity: 0, scale: 0.8, y: 20 },
          animate: {
            opacity: 1,
            scale: [0.8, 1.2, 1],
            y: 0,
            transition: {
              duration: 0.8,
              times: [0, 0.6, 1],
            },
          },
          exit: { opacity: 0, scale: 1.2, transition: { duration: 0.5 } },
        };

      case "defeat":
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: {
            opacity: 1,
            scale: 1,
            rotate: [0, -1, 1, -1, 0],
            transition: {
              duration: 0.6,
              rotate: {
                repeat: 3,
                duration: 0.4,
              },
            },
          },
          exit: { opacity: 0, scale: 0.8 },
        };

      case "battle-start":
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: {
            opacity: 1,
            scale: [0.8, 1.1, 1],
            transition: {
              duration: 0.6,
              times: [0, 0.7, 1],
            },
          },
          exit: { opacity: 0, scale: 0.8 },
        };

      case "turn":
        return {
          initial: { opacity: 0, y: -20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 20 },
        };

      default:
        return baseVariants;
    }
  };

  // Get card background based on action type
  const getCardBackground = () => {
    const actionType = getActionType();

    switch (actionType.type) {
      case "player-attack":
      case "enemy-attack":
        return "bg-gradient-to-r from-[#2a2924]/60 via-[#2a2924]/80 to-[#2a2924]/60";
      case "player-critical":
      case "enemy-critical":
        return "bg-gradient-to-r from-yellow-900/30 via-yellow-600/40 to-yellow-900/30";
      case "player-evade":
      case "enemy-evade":
        return "bg-gradient-to-r from-blue-900/30 via-blue-600/40 to-blue-900/30";
      case "victory":
        return "bg-gradient-to-r from-green-900/30 via-green-600/40 to-green-900/30";
      case "defeat":
        return "bg-gradient-to-r from-red-900/30 via-red-600/40 to-red-900/30";
      case "battle-start":
        return "bg-gradient-to-r from-purple-900/30 via-purple-600/40 to-purple-900/30";
      case "turn":
        return "bg-gradient-to-r from-[#2a2924]/70 via-[#2a2924]/90 to-[#2a2924]/70";
      default:
        return "bg-[#2a2924]/80";
    }
  };

  // Render the next action preview
  const renderNextAction = () => {
    const nextActionType = getNextActionType();
    if (!nextActionType) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0.7, y: 0 }}
        className="absolute bottom-0 right-0 rounded-bl-none rounded-br-none py-1 px-3 bg-black/30 text-xs text-white/70 flex items-center gap-1"
      >
        <span>Next:</span>
        <span className="font-medium">{nextActionType.preview}</span>
      </motion.div>
    );
  };

  return (
    <motion.div
      key={key}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={getAnimationVariants()}
      className={`relative mx-auto mt-6 p-4 rounded-lg border border-[#FFF5E4]/10 shadow-lg max-w-md ${getCardBackground()}`}
    >
      {renderActionContent()}

      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-[#FBE294]/60"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: duration, ease: "linear" }}
      />

      {/* Next action preview */}
      {renderNextAction()}

      {/* Pulse accent for special actions */}
      {(actionType.type.includes("critical") ||
        actionType.type === "victory" ||
        actionType.type === "defeat") && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          initial={{ boxShadow: "0 0 0 rgba(251,226,148,0)" }}
          animate={{
            boxShadow: [
              "0 0 0 rgba(251,226,148,0)",
              "0 0 10px rgba(251,226,148,0.5)",
              "0 0 0 rgba(251,226,148,0)",
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "loop",
          }}
        />
      )}
    </motion.div>
  );
};

export default BattleAction;
