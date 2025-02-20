import React from "react";
import { motion } from "framer-motion";
import orb from "../../assets/guess-start4.png";

const SkeletonPulse = () => (
  <motion.div
    animate={{
      opacity: [0.5, 0.8, 0.5],
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    className="h-full w-full bg-[#FFF5E4]/10 rounded"
  />
);

export const ResultsScreen = ({ secretNumber, finalPoints, onBack }) => {
  const isLoading =
    !finalPoints ||
    !secretNumber ||
    secretNumber === 0 ||
    (finalPoints &&
      (finalPoints.previousBalance === 0 ||
        finalPoints.multiplierUsed === 0 ||
        finalPoints.earned === 0 ||
        finalPoints.newBalance === 0));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-[200]"
    >
      <div className="relative max-w-2xl w-[90vw] flex flex-col items-center z-[200] scale-75 md:scale-100">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full bg-gradient-to-r from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] rounded-t-xl border-t border-x border-[#FFF5E4]/20 p-8 z-[200]"
        >
          <h1 className="text-2xl md:text-4xl font-bold text-center text-[#FFF5E4] tracking-wider">
            CONGRATULATIONS!
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full bg-gradient-to-b from-black/90 to-black/70 border-b border-x border-[#FFF5E4]/20 p-8 space-y-8"
        >
          <div className="text-center h-8">
            <span className="text-[#FFF5E4]/70">Secret Number: </span>
            {isLoading ? (
              <div className="inline-block w-20 h-8">
                <SkeletonPulse />
              </div>
            ) : (
              <span className="text-[#FBE294] font-bold text-2xl">
                {secretNumber}
              </span>
            )}
          </div>

          <div className="space-y-4 text-center">
            <p className="text-[#FFF5E4]/80 italic text-lg">
              The shadows recede as you uncover the secret number.
            </p>
            <p className="text-[#FFF5E4]/80 italic text-lg">
              You've outwitted the night.
            </p>
          </div>

          <div className="border-t border-b border-[#FFF5E4]/20 py-6 space-y-6">
            <div className="flex justify-between items-center h-6">
              <span className="text-[#FFF5E4]/70">Previous Balance:</span>
              {isLoading ? (
                <div className="w-32 h-full">
                  <SkeletonPulse />
                </div>
              ) : (
                <span className="text-[#FFF5E4] font-bold">
                  {finalPoints.previousBalance?.toFixed(2)} points
                </span>
              )}
            </div>

            <div className="bg-[#FFF5E4]/5 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2 h-6">
                <span className="text-[#FFF5E4]/70">Multiplier Earned:</span>
                {isLoading ? (
                  <div className="w-24 h-full">
                    <SkeletonPulse />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <img src={orb} alt="" className="w-6 h-6" />
                    <span className="text-[#FBE294] font-bold">
                      x{finalPoints.multiplierUsed?.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center h-6">
                <span className="text-[#FFF5E4]/70">Points Earned:</span>
                {isLoading ? (
                  <div className="w-32 h-full">
                    <SkeletonPulse />
                  </div>
                ) : (
                  <span
                    className={`font-bold ${
                      finalPoints.earned > 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {finalPoints.earned > 0 ? "+" : ""}
                    {finalPoints.earned.toFixed(2)} points
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#FFF5E4]/10 h-7">
              <span className="text-[#FFF5E4]/70">New Balance:</span>
              {isLoading ? (
                <div className="w-36 h-full">
                  <SkeletonPulse />
                </div>
              ) : (
                <span className="text-[#FFF5E4] font-bold text-lg">
                  {finalPoints.newBalance?.toFixed(2)} points
                </span>
              )}
            </div>
          </div>

          <p className="text-[#FFF5E4]/80 italic text-center text-lg">
            The shadows may fade, but your victory echoes through the dark.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="mt-8 px-12 py-3 bg-gradient-to-r from-[#FFF5E4]/10 via-[#FFF5E4]/20 to-[#FFF5E4]/10 
                    hover:from-[#FFF5E4]/20 hover:via-[#FFF5E4]/30 hover:to-[#FFF5E4]/20
                    border border-[#FFF5E4]/30 rounded-lg text-[#FFF5E4] font-bold text-xl
                    transition-all duration-300"
        >
          BACK
        </motion.button>
      </div>
    </motion.div>
  );
};
