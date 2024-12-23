import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const DiceRollDisplay = ({ roll }) => {
  const [shouldShow, setShouldShow] = useState(true);

  if (
    !roll ||
    !roll.attacker ||
    !roll.defender ||
    !roll.dice1 ||
    !roll.dice2 ||
    !roll.totalDamage
  ) {
    return null;
  }

  const { attacker, defender, dice1, dice2, totalDamage } = roll;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldShow(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!shouldShow) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 180 }}
        className="bg-gray-900/90 backdrop-blur-sm p-8 rounded-xl border-2 border-gray-800"
      >
        <div className="text-center space-y-4">
          <motion.div className="text-lg text-gray-400">
            {attacker.name} 🎲 Initial Attack! 🎲
          </motion.div>
          <div className="flex justify-center gap-8 my-6">
            {[dice1, dice2].map((dice, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 720 }}
                className="text-5xl bg-purple-500/20 p-4 rounded-xl border-2 border-purple-500/30"
              >
                {dice}
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold text-purple-400"
          >
            Total Damage: {totalDamage} HP!
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DiceRollDisplay;
