import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import catopponent from "../../assets/catopponent.webp";

export const CPUTurnOverlay = ({ cpuState, variants, feedbackVariants }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="relative bg-black/50 border border-[#FFF5E4]/20 rounded-xl p-8 max-w-xl w-full mx-4">
        <h2 className="text-3xl font-bold text-center text-[#FFF5E4] mb-8">
          CPU TURN
        </h2>

        <div className="relative flex flex-col items-center">
          <div
            className={`relative rounded-full overflow-hidden mb-8 ${
              cpuState.feedback
                ? cpuState.feedback === "HIGHER!"
                  ? "shadow-[0_0_30px_rgba(34,197,94,0.5)]"
                  : "shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                : ""
            }`}
          >
            <img
              src={catopponent}
              alt="CPU"
              className="w-48 h-48 object-cover"
            />
          </div>

          {cpuState.guess !== null && (
            <div className="text-2xl text-[#FFF5E4]/80 mb-4">
              CPU guesses: {cpuState.guess}
            </div>
          )}

          {!cpuState.feedback && (
            <div className="flex gap-2 justify-center mb-4">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
                className="w-3 h-3 bg-[#FFF5E4] rounded-full"
              />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  delay: 0.2,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
                className="w-3 h-3 bg-[#FFF5E4] rounded-full"
              />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  delay: 0.4,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
                className="w-3 h-3 bg-[#FFF5E4] rounded-full"
              />
            </div>
          )}

          <AnimatePresence mode="wait">
            {cpuState.feedback && (
              <motion.div
                variants={feedbackVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`text-6xl font-bold ${
                  cpuState.feedback === "HIGHER!"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {cpuState.feedback}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
