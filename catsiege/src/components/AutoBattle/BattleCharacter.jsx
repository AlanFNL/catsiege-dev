import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BattleEffects from "./BattleEffects";

const BattleCharacter = ({
  type = "player",
  health,
  maxHealth,
  isAttacking = false,
  effect = null,
  items = [],
}) => {
  // States for animation effects
  const [prevHealth, setPrevHealth] = useState(health);
  const [showDamageFlash, setShowDamageFlash] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  // Calculate health percentage for the progress bar
  const healthPercent = Math.max(0, (health / maxHealth) * 100);

  // Character emojis
  const character = type === "player" ? "🐱" : "🐰";
  const isEnemy = type === "enemy";

  // Check for health changes to trigger damage flash
  useEffect(() => {
    if (health < prevHealth) {
      setShowDamageFlash(true);
      setTimeout(() => setShowDamageFlash(false), 300);
    }
    setPrevHealth(health);

    // Randomly highlight an item when attacking
    if (isAttacking) {
      const randomItem =
        items.length > 0
          ? items[Math.floor(Math.random() * items.length)]
          : null;
      setActiveItem(randomItem);

      // Reset active item after attack
      setTimeout(() => setActiveItem(null), 800);
    }
  }, [health, isAttacking, items, prevHealth]);

  // Animation variants for the character
  const characterAnimations = {
    attack: {
      x: isEnemy ? [-30, 0] : [30, 0],
      rotate: isEnemy ? [-10, 0] : [10, 0],
      transition: { duration: 0.4, ease: "easeOut" },
    },
    idle: {
      y: [0, -3, 0],
      transition: {
        repeat: Infinity,
        repeatType: "reverse",
        duration: 2,
        ease: "easeInOut",
      },
    },
    damaged: {
      x: isEnemy ? [10, -5, 0] : [-10, 5, 0],
      rotate: isEnemy ? [5, -2, 0] : [-5, 2, 0],
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  // Determine which animation to play
  const animationState = isAttacking
    ? "attack"
    : showDamageFlash
    ? "damaged"
    : "idle";

  return (
    <div className="flex flex-col items-center relative">
      <div className="relative">
        {/* Character container */}
        <motion.div
          animate={characterAnimations[animationState]}
          className="w-32 h-32 bg-[#1d1c19] rounded-lg mb-4 flex items-center justify-center relative mx-auto overflow-hidden"
        >
          {/* Damage flash overlay */}
          <AnimatePresence>
            {showDamageFlash && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-red-500 z-10 mix-blend-overlay"
              />
            )}
          </AnimatePresence>

          {/* Character emoji */}
          <span className="text-6xl relative z-0">{character}</span>

          {/* Active effect overlay */}
          <BattleEffects effect={effect} isEnemy={isEnemy} />
        </motion.div>
      </div>

      <h3 className="text-lg font-bold text-[#FFF5E4] mb-2">
        {isEnemy ? "Enemy" : "Player"}
      </h3>

      {/* Health bar with animations */}
      <div className="w-full h-4 bg-[#1d1c19] rounded-full overflow-hidden mb-2 relative">
        {/* Health loss indicator - shows red bar that animates away when health decreases */}
        {health < prevHealth && (
          <motion.div
            initial={{
              width: `${(prevHealth / maxHealth) * 100}%`,
              opacity: 1,
            }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute top-0 left-0 h-full bg-red-500/40 z-0"
          />
        )}

        {/* Actual health bar */}
        <motion.div
          animate={{ width: `${healthPercent}%` }}
          initial={{ width: `${healthPercent}%` }}
          transition={{ duration: 0.5 }}
          className={`h-full relative z-10 ${
            healthPercent > 60
              ? "bg-gradient-to-r from-green-600 to-green-400"
              : healthPercent > 25
              ? "bg-gradient-to-r from-yellow-600 to-yellow-400"
              : "bg-gradient-to-r from-red-600 to-red-400"
          }`}
        />
      </div>

      <p className="text-[#FFF5E4]/80 text-sm">
        HP: {health}/{maxHealth}
      </p>

      {/* Item display */}
      <div className="flex mt-4 gap-2 flex-wrap justify-center">
        {items.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.2, y: -5 }}
            animate={
              activeItem?.id === item.id
                ? {
                    scale: [1, 1.3, 1],
                    y: [0, -10, 0],
                    transition: { duration: 0.8 },
                  }
                : {}
            }
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl cursor-pointer group relative transition-all ${
              activeItem?.id === item.id
                ? `bg-[#2a2924] ${
                    item.rarity.name === "Legendary"
                      ? "shadow-lg shadow-yellow-500/30"
                      : "shadow-md shadow-white/20"
                  }`
                : "bg-[#1d1c19]"
            }`}
            title={item.name}
          >
            <span>{item.icon}</span>

            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#2a2924]/90 backdrop-blur-sm rounded border border-[#FFF5E4]/20 text-xs text-[#FFF5E4] opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              <p className={`font-bold ${item.rarity.color}`}>{item.name}</p>
              <p className="text-xs text-[#FFF5E4]/80 mt-1">
                {item.description}
              </p>
            </div>

            {/* Active item indicator */}
            {activeItem?.id === item.id && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute -inset-1 border border-[#FBE294]/50 rounded-lg z-0"
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BattleCharacter;
