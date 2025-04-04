import React from "react";
import { Info } from "lucide-react";
import { motion } from "framer-motion";

const GameHeader = ({ gameState, onInfoOpen }) => {
  // Map game state to header title
  const headerTitles = {
    selection: "PREPARE FOR BATTLE",
    battle: "AUTO BATTLE",
    results: "BATTLE RESULTS",
  };

  return (
    <div className="w-full mb-8 relative">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#FBE294] mb-2">CATSIEGE</h1>
        <motion.div
          key={gameState}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-[#FFF5E4]">
            {headerTitles[gameState]}
          </h2>
        </motion.div>
        <p className="text-[#FFF5E4]/60 mt-2">
          Equip your warrior with powerful items from the ruins
        </p>
      </div>

      {onInfoOpen && (
        <button
          onClick={onInfoOpen}
          className="absolute top-0 right-0 p-2 rounded-full bg-[#FFF5E4]/10 hover:bg-[#FFF5E4]/20 transition-colors"
          aria-label="Game Information"
          tabIndex="0"
        >
          <Info className="w-5 h-5 text-[#FFF5E4]/70" />
        </button>
      )}
    </div>
  );
};

export default GameHeader;
