import React from "react";
import { motion } from "framer-motion";

const HitRollDisplay = ({ roll }) => {
  const { attacker, defender, roll: rollValue, required } = roll || {};

  const getHitType = (roll) => {
    if (roll < 10) {
      return {
        text: "MISS!",
        color: "text-red-400",
      };
    } else if (roll < 31) {
      return {
        text: "Light Hit!",
        color: "text-yellow-400",
      };
    } else if (roll < 71) {
      return {
        text: "Medium Hit!",
        color: "text-orange-400",
      };
    } else {
      return {
        text: "Critical Hit!",
        color: "text-green-400",
      };
    }
  };

  const hitResult = getHitType(rollValue);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        className="bg-gray-900/90 backdrop-blur-sm p-8 rounded-xl border-2 border-gray-800"
      >
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4 text-lg">
            <span className="text-purple-400 font-semibold">
              {attacker.name}
            </span>
            <motion.span
              animate={{ x: [0, 10, 0] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-gray-400"
            >
              →
            </motion.span>
            <span className="text-gray-400">{defender.name}</span>
          </div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-6xl font-bold text-purple-400"
          >
            🎲 {rollValue}
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{
              scale: [1, 1.1, 1],
              rotate:
                hitResult.text === "Critical Hit!" ? [0, -5, 5, -5, 0] : 0,
            }}
            transition={{
              duration: hitResult.text === "Critical Hit!" ? 0.5 : 0.3,
              ease: "easeInOut",
            }}
            className={`text-2xl font-bold ${hitResult.color}`}
          >
            {hitResult.text}
          </motion.div>

          {rollValue >= 10 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-gray-400"
            >
              Damage: {rollValue < 31 ? 1 : rollValue < 71 ? 2 : 3}
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HitRollDisplay;
