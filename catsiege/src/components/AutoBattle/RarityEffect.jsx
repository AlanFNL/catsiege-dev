import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const RarityEffect = ({ rarity, isVisible }) => {
  const [confetti, setConfetti] = useState([]);

  // Generate confetti particles for legendary items
  useEffect(() => {
    if (isVisible && rarity?.name?.toLowerCase() === "legendary") {
      // Generate 30 confetti particles with random positions
      const newConfetti = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 200 - 100, // Position randomly around center (-100 to 100)
        y: Math.random() * 50 - 100, // Start above the item
        size: Math.random() * 8 + 4, // Size between 4-12px
        color: [
          "#f59e0b", // amber-500
          "#fbbf24", // amber-400
          "#fcd34d", // amber-300
          "#fef3c7", // amber-100
          "#d97706", // amber-600
        ][Math.floor(Math.random() * 5)],
        duration: 0.5 + Math.random() * 1, // Animation duration between 0.5-1.5s
        delay: Math.random() * 0.5, // Delay start by 0-0.5s
      }));

      setConfetti(newConfetti);

      // Clean up confetti after they've fallen
      const timer = setTimeout(() => {
        setConfetti([]);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, rarity]);

  // No effect for common items
  if (!isVisible || !rarity || rarity.name.toLowerCase() === "common") {
    return null;
  }

  // Different effects based on rarity
  switch (rarity.name.toLowerCase()) {
    case "legendary":
      return (
        <>
          {/* Golden burst effect */}
          <AnimatePresence>
            <motion.div
              key="legendary-burst"
              initial={{ opacity: 0, scale: 0.2 }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0.2, 1.5, 2],
                rotate: [0, 45],
              }}
              transition={{
                duration: 1.5,
                times: [0, 0.3, 1],
              }}
              className="absolute inset-0 z-10 pointer-events-none"
            >
              <div className="absolute inset-0 bg-amber-500 opacity-30 rounded-full blur-xl"></div>
              <div className="absolute inset-0 bg-amber-400 opacity-20 rounded-full blur-3xl"></div>
            </motion.div>

            {/* Gold rays */}
            <motion.div
              key="legendary-rays"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0] }}
              transition={{ duration: 2 }}
              className="absolute inset-0 z-0 pointer-events-none"
            >
              <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] -translate-x-1/2 -translate-y-1/2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-0.5 h-[150px] bg-gradient-to-t from-amber-500 to-transparent origin-bottom"
                    style={{
                      transform: `rotate(${i * 30}deg) translateY(-100%)`,
                    }}
                  ></div>
                ))}
              </div>
            </motion.div>

            {/* Confetti particles */}
            {confetti.map((particle) => (
              <motion.div
                key={`confetti-${particle.id}`}
                initial={{
                  x: particle.x,
                  y: particle.y,
                  opacity: 1,
                  scale: 0,
                }}
                animate={{
                  y: particle.y + 400,
                  x: particle.x + (Math.random() * 100 - 50),
                  opacity: [1, 1, 0],
                  scale: [0, 1, 0.8],
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  ease: "easeOut",
                }}
                className="absolute top-1/2 left-1/2 rounded-sm z-20 pointer-events-none"
                style={{
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                }}
              />
            ))}
          </AnimatePresence>
        </>
      );

    case "epic":
      return (
        <AnimatePresence>
          <motion.div
            key="epic-effect"
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{
              opacity: [0, 0.7, 0],
              scale: [0.2, 1.2, 1.5],
            }}
            transition={{
              duration: 1.2,
              times: [0, 0.3, 1],
            }}
            className="absolute inset-0 z-10 pointer-events-none"
          >
            <div className="absolute inset-0 bg-purple-600 opacity-30 rounded-full blur-xl"></div>
            <div className="absolute inset-0 bg-purple-500 opacity-20 rounded-full blur-3xl"></div>
          </motion.div>
        </AnimatePresence>
      );

    case "rare":
      return (
        <AnimatePresence>
          <motion.div
            key="rare-effect"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0, 0.5, 0],
              scale: [0.5, 1.1, 1.3],
            }}
            transition={{
              duration: 1,
              times: [0, 0.3, 1],
            }}
            className="absolute inset-0 z-10 pointer-events-none"
          >
            <div className="absolute inset-0 bg-blue-600 opacity-20 rounded-full blur-xl"></div>
          </motion.div>
        </AnimatePresence>
      );

    case "uncommon":
      return (
        <AnimatePresence>
          <motion.div
            key="uncommon-effect"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0, 0.3, 0],
              scale: [0.5, 1, 1.1],
            }}
            transition={{
              duration: 0.8,
              times: [0, 0.3, 1],
            }}
            className="absolute inset-0 z-10 pointer-events-none"
          >
            <div className="absolute inset-0 bg-emerald-600 opacity-15 rounded-full blur-lg"></div>
          </motion.div>
        </AnimatePresence>
      );

    default:
      return null;
  }
};

export default RarityEffect;
