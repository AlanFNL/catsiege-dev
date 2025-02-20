import React from "react";
import { motion } from "framer-motion";
import orb from "../../assets/guess-start4.png";

export const GameOverModal = ({
  hasWon,
  turns,
  MAX_TURNS,
  multiplier,
  secretNumber,
  finalPoints,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
    >
      <div className="bg-gray-900/90 p-8 rounded-xl border-2 border-yellow-500">
        <h2 className="text-2xl font-bold text-yellow-500 mb-4">
          {hasWon
            ? "You Won!"
            : turns > MAX_TURNS
            ? "Out of Turns!"
            : multiplier <= 0
            ? "Multiplier Depleted!"
            : "CPU Won!"}
        </h2>
        <p className="text-white">
          {turns > MAX_TURNS
            ? "You've exceeded the maximum number of turns!"
            : multiplier <= 0
            ? "You ran out of multiplier power!"
            : `The number was: ${secretNumber}`}
        </p>

        <div className="border-t border-b border-[#FFF5E4]/20 py-6 space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-[#FFF5E4]/70">Previous Balance:</span>
            <span className="text-[#FFF5E4] font-bold">
              {finalPoints.previousBalance?.toFixed(2)} points
            </span>
          </div>

          <div className="bg-[#FFF5E4]/5 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#FFF5E4]/70">Multiplier Earned:</span>
              <div className="flex items-center gap-2">
                <img src={orb} alt="" className="w-6 h-6" />
                <span className="text-[#FBE294] font-bold">
                  x{finalPoints.multiplierUsed?.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#FFF5E4]/70">Points Earned:</span>
              <span
                className={`font-bold ${
                  finalPoints.earned > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {finalPoints.earned > 0 ? "+" : ""}
                {finalPoints.earned.toFixed(2)} points
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-[#FFF5E4]/10">
            <span className="text-[#FFF5E4]/70">New Balance:</span>
            <span className="text-[#FFF5E4] font-bold text-lg">
              {finalPoints.newBalance?.toFixed(2)} points
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
