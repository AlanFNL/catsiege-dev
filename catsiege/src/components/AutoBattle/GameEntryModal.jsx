import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

const ENTRY_COST = 50;

const GameEntryModal = ({ isOpen, onClose, onConfirm, isLoading = false }) => {
  const { user } = useAuth();

  if (!isOpen || !user) return null;

  const newBalance = Math.max(0, user.points - ENTRY_COST);
  const canAfford = user.points >= ENTRY_COST;

  // Handle confirmation
  const handleConfirm = () => {
    if (canAfford && !isLoading) {
      onConfirm();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={!isLoading ? onClose : undefined}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#2a2924]/90 backdrop-blur-md p-6 rounded-xl border-2 border-[#FFF5E4]/20 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-[#FBE294] mb-4 text-center">
              Start Battle
            </h2>

            <div className="space-y-4 mb-6">
              <p className="text-[#FFF5E4] text-center">
                Are you ready to enter the AutoBattle Arena?
              </p>

              <div className="bg-[#1d1c19] p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-[#FFF5E4]/80">Entry Cost:</span>
                  <span className="text-[#FFF5E4] font-bold">
                    {ENTRY_COST} points
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-[#FFF5E4]/80">Current Balance:</span>
                  <span className="text-[#FFF5E4] font-bold">
                    {user.points} points
                  </span>
                </div>
                <hr className="border-[#FFF5E4]/20 my-2" />
                <div className="flex justify-between">
                  <span className="text-[#FFF5E4]/80">New Balance:</span>
                  <span
                    className={`font-bold ${
                      canAfford ? "text-[#FFF5E4]" : "text-red-400"
                    }`}
                  >
                    {newBalance} points
                  </span>
                </div>
              </div>

              {!canAfford && (
                <div className="text-red-400 text-center text-sm">
                  You don't have enough points to start a battle!
                </div>
              )}

              <div className="bg-[#1d1c19] p-4 rounded-lg text-sm text-[#FFF5E4]/70">
                <p className="mb-2">
                  <span className="text-[#FBE294]">Victory:</span> Win 1.9x your
                  entry cost ({ENTRY_COST * 1.9} points)
                </p>
                <p>
                  <span className="text-[#FBE294]">Defeat:</span> Lose your
                  entry cost
                </p>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                disabled={isLoading}
                className={`px-5 py-2 bg-[#1d1c19]/80 text-[#FFF5E4] rounded-lg font-semibold ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Cancel
              </motion.button>

              <motion.button
                whileHover={canAfford && !isLoading ? { scale: 1.05 } : {}}
                whileTap={canAfford && !isLoading ? { scale: 0.95 } : {}}
                onClick={handleConfirm}
                disabled={!canAfford || isLoading}
                className={`px-5 py-2 rounded-lg font-semibold min-w-[120px] ${
                  !canAfford
                    ? "bg-[#FBE294]/40 text-[#1d1c19]/60 cursor-not-allowed"
                    : isLoading
                    ? "bg-[#FBE294]/70 text-[#1d1c19] cursor-wait"
                    : "bg-[#FBE294] text-[#1d1c19] cursor-pointer"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#1d1c19]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading...
                  </div>
                ) : (
                  "Start Battle"
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameEntryModal;
