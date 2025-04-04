import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

const ENTRY_COST = 50;
const WIN_MULTIPLIER = 1.9;

const GameResultModal = ({
  isOpen,
  onClose,
  onNewBattle,
  onViewDetails,
  result,
}) => {
  const { user, refreshUser } = useAuth();

  if (!isOpen || !result) return null;

  const { winner, playerCharacter, enemyCharacter } = result;
  const playerWon = winner === "player";

  const pointsChange = playerWon
    ? Math.floor(ENTRY_COST * WIN_MULTIPLIER)
    : -ENTRY_COST;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#2a2924]/90 backdrop-blur-md p-6 rounded-xl border-2 border-[#FFF5E4]/20 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className={`text-3xl font-bold mb-4 text-center ${
                playerWon ? "text-[#FBE294]" : "text-red-400"
              }`}
            >
              {playerWon ? "Victory!" : "Defeat!"}
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center bg-[#1d1c19] p-4 rounded-lg">
                <div className="text-center">
                  <p className="text-[#FFF5E4]/70 text-sm">Your Character</p>
                  <p className="text-[#FFF5E4] font-bold">
                    {playerCharacter?.name || "Player"}
                  </p>
                </div>

                <div className="text-xl font-bold text-[#FBE294]">VS</div>

                <div className="text-center">
                  <p className="text-[#FFF5E4]/70 text-sm">Enemy</p>
                  <p className="text-[#FFF5E4] font-bold">
                    {enemyCharacter?.name || "Enemy"}
                  </p>
                </div>
              </div>

              <div className="bg-[#1d1c19] p-4 rounded-lg">
                <div className="text-center mb-3">
                  <span className="text-[#FFF5E4]/80 text-sm">Points</span>
                  <div
                    className={`text-2xl font-bold ${
                      playerWon ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {playerWon ? "+" : ""}
                    {pointsChange}
                  </div>
                </div>

                {playerWon && (
                  <div className="text-center text-sm text-green-400">
                    Congratulations! Your reward has been added to your balance.
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onViewDetails}
                className="w-full px-5 py-3 bg-[#1d1c19] text-[#FFF5E4] rounded-lg font-semibold"
              >
                View Battle Details
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onNewBattle}
                className="w-full px-5 py-3 bg-[#FBE294] text-[#1d1c19] rounded-lg font-semibold"
              >
                Start New Battle
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameResultModal;
