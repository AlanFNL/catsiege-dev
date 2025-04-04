import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { gameService } from "../../services/api";
import { BASE_STATS, STATS } from "./constants";
import GameEntryModal from "./GameEntryModal";
import GameResultModal from "./GameResultModal";
import CharacterCard from "./CharacterCard";

const ENTRY_COST = 50;

const BattlePreparation = ({ onStartBattle, onViewBattleHistory }) => {
  const { user, updateUserPoints } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [battleResult, setBattleResult] = useState(null);
  const [playerCharacter, setPlayerCharacter] = useState({
    name: "Your Character",
    stats: { ...BASE_STATS },
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Handle entry confirmation
  const handleConfirmEntry = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First deduct points from user balance to update UI immediately
      await updateUserPoints(-ENTRY_COST);

      // Start auto battle game session
      const response = await gameService.startAutoBattle();

      if (response) {
        setShowEntryModal(false);

        // Show success message briefly
        setShowSuccessMessage(true);

        // Start the battle after a short delay to show the success message
        setTimeout(() => {
          setShowSuccessMessage(false);
          onStartBattle();
        }, 1500);
      } else {
        // If there was an error, refund the points
        await updateUserPoints(ENTRY_COST);
        setError(response?.message || "Failed to start battle");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error starting battle:", err);
      // Attempt to refund points if there was an error
      try {
        await updateUserPoints(ENTRY_COST);
      } catch (refundError) {
        console.error("Failed to refund points:", refundError);
      }
      setError("An error occurred while starting the battle");
      setIsLoading(false);
    }
  };

  // Handle battle completion
  const handleBattleComplete = async (result) => {
    setIsLoading(true);

    try {
      // Record battle result
      const response = await gameService.completeAutoBattle({
        winner: result.winner,
        playerCharacter: result.playerCharacter,
        enemyCharacter: result.enemyCharacter,
        battleLog: result.battleLog,
      });

      if (response && response.success) {
        // Set battle result for modal
        setBattleResult(result);

        // Show result modal
        setShowResultModal(true);
      } else {
        setError(response?.message || "Failed to complete battle");
      }
    } catch (err) {
      console.error("Error completing battle:", err);
      setError("An error occurred while completing the battle");
    } finally {
      setIsLoading(false);
    }
  };

  // Start a new battle
  const handleNewBattle = () => {
    setShowResultModal(false);
    setShowEntryModal(true);
  };

  // View battle details
  const handleViewDetails = () => {
    setShowResultModal(false);
    // Navigate to battle details or show details modal
    onViewBattleHistory(battleResult);
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-[#FBE294] mb-8">Battle Arena</h2>

      {/* Success message when starting battle */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-center"
        >
          <p className="text-white font-bold">
            Entry confirmed! Preparing battle...
          </p>
        </motion.div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-center">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
        {/* Player Character Card */}
        <div className="w-full md:w-1/2">
          <CharacterCard
            character={{
              name: "Your Champion",
              stats: playerCharacter.stats,
            }}
            isPlayer={true}
          />
        </div>

        {/* VS Divider */}
        <div className="hidden md:flex flex-col items-center">
          <div className="h-32 w-px bg-[#FFF5E4]/20 mb-4"></div>
          <div className="bg-[#333] rounded-full w-10 h-10 flex items-center justify-center text-[#FBE294] font-bold">
            VS
          </div>
          <div className="h-32 w-px bg-[#FFF5E4]/20 mt-4"></div>
        </div>

        {/* Enemy Character Card */}
        <div className="w-full md:w-1/2">
          <CharacterCard
            character={{
              name: "Random Challenger",
              // We don't know enemy stats yet, just show default
              stats: BASE_STATS,
            }}
            isEnemy={true}
          />
        </div>
      </div>

      <div className="text-center mb-8 max-w-2xl">
        <h3 className="text-xl font-bold text-[#FFF5E4] mb-3">
          AutoBattle Arena
        </h3>
        <p className="text-[#FFF5E4]/70 mb-4">
          Test your luck in the arena! Pay {ENTRY_COST} points to enter and
          choose your items carefully to build the strongest champion.
        </p>
        <div className="bg-[#1d1c19] p-4 rounded-lg text-[#FFF5E4]/70 mb-6">
          <p className="font-bold text-[#FBE294] mb-2">How It Works:</p>
          <ol className="text-left list-decimal list-inside space-y-2">
            <li>Pay {ENTRY_COST} points to enter the arena</li>
            <li>Select three powerful items for your champion</li>
            <li>Watch the battle unfold automatically</li>
            <li>
              Victory rewards you with {ENTRY_COST * 1.9} points (
              {ENTRY_COST * 0.9} profit)
            </li>
          </ol>
        </div>

        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowEntryModal(true)}
            disabled={isLoading}
            className={`px-8 py-3 bg-[#FBE294] text-[#1d1c19] rounded-lg font-bold text-lg shadow-lg ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Loading..." : "Start Battle"}
          </motion.button>
        </div>

        <div className="mt-8">
          <button
            onClick={onViewBattleHistory}
            className="w-full py-2 bg-[#2a2924] hover:bg-[#3a3934] text-[#FFF5E4]/80 rounded-lg transition"
          >
            View Battle History
          </button>
        </div>
      </div>

      {/* Entry Modal */}
      <GameEntryModal
        isOpen={showEntryModal}
        onClose={() => !isLoading && setShowEntryModal(false)}
        onConfirm={handleConfirmEntry}
        isLoading={isLoading}
      />

      {/* Result Modal */}
      <GameResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        onNewBattle={handleNewBattle}
        onViewDetails={handleViewDetails}
        result={battleResult}
      />
    </div>
  );
};

export default BattlePreparation;
