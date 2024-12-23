import React from "react";
import { motion } from "framer-motion";

const BattleWinnerAnimation = ({ winner }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 z-50 flex items-center justify-center"
  >
    {/* Background flash effect */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.2, 0] }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 bg-purple-500"
    />

    {/* Victory message with effects */}
    <motion.div
      className="bg-gradient-to-r from-purple-500/40 to-indigo-500/40 backdrop-blur-md
                 rounded-xl p-6 border-2 border-purple-400/50 shadow-2xl
                 flex flex-col items-center gap-2"
      initial={{ scale: 0.5, y: 20 }}
      animate={{
        scale: 1,
        y: 0,
        boxShadow: [
          "0 0 20px rgba(168, 85, 247, 0.4)",
          "0 0 40px rgba(168, 85, 247, 0.6)",
          "0 0 20px rgba(168, 85, 247, 0.4)",
        ],
      }}
      transition={{
        duration: 0.4,
        boxShadow: {
          repeat: Infinity,
          duration: 2,
        },
      }}
    >
      <motion.span
        className="text-4xl"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [-10, 10, -10, 10, 0],
        }}
        transition={{ duration: 0.6 }}
      >
        👑
      </motion.span>

      <motion.div
        className="text-3xl font-bold text-transparent bg-clip-text 
                   bg-gradient-to-r from-purple-200 to-purple-400"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.6 }}
      >
        Victory!
      </motion.div>

      <motion.div
        className="text-sm text-purple-200/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {winner.name}
      </motion.div>

      {/* Particle effects */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-purple-400 rounded-full"
          initial={{
            scale: 0,
            x: 0,
            y: 0,
          }}
          animate={{
            scale: [0, 1, 0],
            x: Math.cos((i * 30 * Math.PI) / 180) * 100,
            y: Math.sin((i * 30 * Math.PI) / 180) * 100,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.8,
            delay: i * 0.02,
            ease: "easeOut",
          }}
        />
      ))}
    </motion.div>
  </motion.div>
);

export default BattleWinnerAnimation;
