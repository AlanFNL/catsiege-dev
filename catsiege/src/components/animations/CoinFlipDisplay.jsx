import React, { useEffect } from "react";
import { motion } from "framer-motion";

const CoinFlipDisplay = ({ winner, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

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
          <motion.div
            className="text-2xl font-bold text-purple-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {winner.name} Attacks First!
          </motion.div>
          <motion.div
            initial={{ rotateY: 0 }}
            animate={{ rotateY: 720 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-6xl my-4"
          >
            🪙
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CoinFlipDisplay;
