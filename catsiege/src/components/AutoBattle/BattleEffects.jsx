import React from "react";
import { motion, AnimatePresence } from "framer-motion";

// Effect types
export const EFFECT_TYPES = {
  ATTACK: "attack",
  CRITICAL: "critical",
  EVADE: "evade",
  DAMAGE: "damage",
  ITEM_USE: "item_use",
};

const BattleEffects = ({ effect, position, isEnemy = false }) => {
  if (!effect) return null;

  // Calculate position based on whether it's player or enemy
  const positionClass = isEnemy ? "right-1/4" : "left-1/4";

  // Render different effects based on type
  switch (effect.type) {
    case EFFECT_TYPES.ATTACK:
      return (
        <AnimatePresence>
          <motion.div
            className={`absolute ${positionClass} top-1/3 pointer-events-none`}
            initial={{ opacity: 0, scale: 0.5, y: -20 }}
            animate={{ opacity: 1, scale: 1.5, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <motion.div
                className="absolute -inset-4"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.7, 0],
                  scale: [1, 1.5, 1.8],
                }}
                transition={{ duration: 0.5, times: [0, 0.2, 1] }}
              >
                <div className="w-full h-full rounded-full bg-orange-500/30 backdrop-blur-sm" />
              </motion.div>
              <span className="text-4xl">💥</span>
            </div>
          </motion.div>
        </AnimatePresence>
      );

    case EFFECT_TYPES.CRITICAL:
      return (
        <AnimatePresence>
          <motion.div
            className={`absolute ${positionClass} top-1/3 pointer-events-none`}
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{
              opacity: 1,
              scale: [1, 1.5, 1.2],
              rotate: [0, 5, -5, 0],
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative">
              <motion.div
                className="absolute -inset-8"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.9, 0],
                  scale: [1, 1.8, 2.2],
                }}
                transition={{ duration: 0.7, times: [0, 0.3, 1] }}
              >
                <div className="w-full h-full rounded-full bg-yellow-500/40 backdrop-blur-sm" />
              </motion.div>
              <span className="text-5xl">⚡</span>
            </div>
          </motion.div>
        </AnimatePresence>
      );

    case EFFECT_TYPES.EVADE:
      return (
        <AnimatePresence>
          <motion.div
            className={`absolute ${positionClass} top-1/3 pointer-events-none`}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -20 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <motion.div
                className="absolute -inset-4"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.7, 0],
                  scale: [1, 1.2, 1.5],
                }}
                transition={{ duration: 0.5, times: [0, 0.2, 1] }}
              >
                <div className="w-full h-full rounded-full bg-blue-500/30 backdrop-blur-sm" />
              </motion.div>
              <span className="text-4xl">💨</span>
            </div>
          </motion.div>
        </AnimatePresence>
      );

    case EFFECT_TYPES.DAMAGE:
      // Render floating damage number
      return (
        <AnimatePresence>
          <motion.div
            className={`absolute ${positionClass} top-1/3 pointer-events-none`}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -30 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ duration: 0.8 }}
          >
            <div className="font-bold text-2xl text-red-500 drop-shadow-lg">
              -{effect.value}
            </div>
          </motion.div>
        </AnimatePresence>
      );

    case EFFECT_TYPES.ITEM_USE:
      // Item use effect - more elaborate and colorful than regular attacks
      return (
        <AnimatePresence>
          <motion.div
            className={`absolute ${positionClass} top-1/3 pointer-events-none`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.8 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative">
              {/* Outer glow ring */}
              <motion.div
                className="absolute -inset-10 z-0"
                initial={{ opacity: 0, rotate: 0 }}
                animate={{
                  opacity: [0, 0.9, 0],
                  scale: [1, 1.8, 2.2],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 1,
                  times: [0, 0.4, 1],
                  ease: "easeInOut",
                }}
              >
                <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-500/60 to-yellow-400/60 backdrop-blur-sm" />
              </motion.div>

              {/* Secondary pulse ring */}
              <motion.div
                className="absolute -inset-6 z-0"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.7, 0],
                  scale: [0.8, 1.3, 1.6],
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.1,
                  times: [0, 0.3, 1],
                }}
              >
                <div className="w-full h-full rounded-full bg-gradient-to-r from-yellow-400/40 to-blue-500/40 backdrop-blur-sm" />
              </motion.div>

              {/* Item icon display */}
              <div className="relative flex items-center justify-center z-10">
                <motion.span
                  className="text-5xl absolute drop-shadow-lg"
                  initial={{ opacity: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    y: [-10, 0, 10],
                    scale: [0.8, 1.5, 0.8],
                    rotate: [-5, 0, 5],
                  }}
                  transition={{ duration: 0.8 }}
                >
                  {effect.icon || "✨"}
                </motion.span>

                {/* Star burst effect */}
                <motion.div
                  className="absolute w-full h-full"
                  initial={{ opacity: 0, rotate: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    rotate: [0, 90],
                  }}
                  transition={{ duration: 0.8 }}
                >
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={`star-${i}`}
                      className="absolute inset-0 w-full h-full"
                      initial={{ rotate: i * 45 }}
                    >
                      <motion.div
                        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-3 bg-yellow-300 rounded-full"
                        animate={{ height: [3, 15, 5], opacity: [0.5, 1, 0] }}
                        transition={{ duration: 0.8, delay: i * 0.05 }}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Particle effects */}
                <motion.div
                  className="absolute w-full h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* More particles - 12 instead of 6 */}
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`absolute w-2 h-2 rounded-full ${
                        i % 3 === 0
                          ? "bg-yellow-300"
                          : i % 3 === 1
                          ? "bg-blue-300"
                          : "bg-purple-300"
                      }`}
                      initial={{
                        x: 0,
                        y: 0,
                        opacity: 0,
                        scale: 0.5,
                      }}
                      animate={{
                        x:
                          Math.random() > 0.5
                            ? [0, 40 * Math.random()]
                            : [0, -40 * Math.random()],
                        y:
                          Math.random() > 0.5
                            ? [0, 40 * Math.random()]
                            : [0, -40 * Math.random()],
                        opacity: [0, 1, 0],
                        scale: [0.5, Math.random() + 0.5, 0],
                      }}
                      transition={{
                        duration: 0.8,
                        delay: i * 0.04,
                      }}
                    />
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      );

    default:
      return null;
  }
};

export default BattleEffects;
