import React from "react";
import { motion } from "framer-motion";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "react-use";

const WinnerDisplay = ({ winner, onClose }) => {
  const { width, height } = useWindowSize();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full min-h-screen bg-black/90 backdrop-blur-md"
    >
      <ReactConfetti
        width={width}
        height={height}
        numberOfPieces={200}
        recycle={false}
      />

      <div className="flex items-center justify-center h-full min-h-screen">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          className="bg-gray-900/90 p-8 rounded-xl border-2 border-purple-500
                     text-center space-y-6 max-w-md mx-auto"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-purple-400"
          >
            Tournament Winner!
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <img
              src={winner?.image}
              alt={winner?.name}
              className="w-64 h-64 object-cover rounded-lg mx-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-500/50 to-transparent rounded-lg" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white"
          >
            {winner?.name}
          </motion.div>

          {onClose && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-purple-500 text-white rounded-full
                       hover:bg-purple-600 transition-colors"
            >
              Close
            </motion.button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WinnerDisplay;
