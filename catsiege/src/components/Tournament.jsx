import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";

function Tournament() {
  const [tournamentState, setTournamentState] = useState({
    currentRound: 0,
    brackets: [],
    currentMatch: null,
    winners: [],
    isRunning: false,
    roundSizes: [512, 256, 128, 64, 32, 16, 8, 4, 2, 1],
  });

  const socketRef = useRef();

  useEffect(() => {
    // Initialize socket connection using environment variable
    const SERVER_URL =
      import.meta.env.VITE_SERVER_URL || "http://localhost:3001";
    socketRef.current = io(SERVER_URL);

    // Listen for tournament state updates
    socketRef.current.on("tournamentState", (state) => {
      setTournamentState(state);
    });

    // Listen for battle updates
    socketRef.current.on("battleUpdate", ({ nft1, nft2 }) => {
      setTournamentState((prev) => ({
        ...prev,
        currentMatch: { nft1, nft2 },
      }));
    });

    // Handle errors
    socketRef.current.on("error", (error) => {
      console.error("Socket error:", error);
    });

    // Cleanup on unmount
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const initializeTournament = () => {
    socketRef.current.emit("initializeTournament");
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">NFT Tournament</h1>

        {!tournamentState.isRunning &&
          tournamentState.brackets.length === 0 && (
            <button
              onClick={initializeTournament}
              className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Start Tournament
            </button>
          )}

        {/* Current Match Display */}
        {tournamentState.currentMatch && (
          <div className="mb-8">
            <h2 className="text-2xl mb-4">Current Battle</h2>
            <div className="flex justify-center gap-8">
              <BattleCard nft={tournamentState.currentMatch.nft1} />
              <div className="text-4xl flex items-center">VS</div>
              <BattleCard nft={tournamentState.currentMatch.nft2} />
            </div>
          </div>
        )}

        {/* Brackets Display */}
        <div className="mt-8">
          <h2 className="text-2xl mb-4">
            Round {tournamentState.currentRound + 1} - Remaining:{" "}
            {tournamentState.brackets[tournamentState.currentRound]?.length}
          </h2>
          <div className="grid grid-cols-4 gap-4">
            <AnimatePresence>
              {tournamentState.brackets[tournamentState.currentRound]?.map(
                (nft) => (
                  <NFTCard key={nft.id} nft={nft} />
                )
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Winner Display */}
        {!tournamentState.isRunning && tournamentState.winners.length > 0 && (
          <WinnerDisplay winner={tournamentState.winners[0]} />
        )}
      </div>
    </div>
  );
}

// Helper components
const BattleCard = ({ nft }) => (
  <motion.div
    className="bg-gray-800 p-6 rounded-lg shadow-xl"
    animate={{ scale: [1, 1.05, 1] }}
    transition={{ duration: 0.5, repeat: Infinity }}
  >
    <div className="relative">
      <img
        src={nft.image}
        alt={nft.name}
        className="w-64 h-64 object-cover rounded-lg shadow-lg"
        loading="lazy"
      />
      <motion.div
        className="absolute inset-0 border-4 border-transparent"
        animate={{
          borderColor: [
            "rgba(255,255,255,0)",
            "rgba(255,255,255,0.3)",
            "rgba(255,255,255,0)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
    <div className="mt-4 text-center">
      <h3 className="text-xl font-bold truncate">{nft.name}</h3>
      <div className="mt-2 flex justify-center items-center gap-2">
        <span className="text-red-500">❤️</span>
        <span className="font-mono">{nft.health}/2</span>
      </div>
    </div>
  </motion.div>
);

const NFTCard = ({ nft }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    className="bg-gray-800 p-3 rounded-lg shadow-md hover:shadow-xl transition-shadow"
  >
    <div className="relative">
      <img
        src={nft.image}
        alt={nft.name}
        className="w-full h-40 object-cover rounded-md"
        loading="lazy"
      />
      <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full px-2 py-1">
        <span className="text-xs">❤️ {nft.health}</span>
      </div>
    </div>
    <div className="mt-2">
      <h3 className="text-sm font-medium truncate">{nft.name}</h3>
      <div className="text-xs text-gray-400 mt-1">#{nft.mint.slice(-4)}</div>
    </div>
  </motion.div>
);

const WinnerDisplay = ({ winner }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center mt-8"
  >
    <motion.h2
      className="text-4xl font-bold mb-6"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      🏆 Tournament Winner! 🏆
    </motion.h2>
    <motion.div
      className="bg-gray-800 p-8 rounded-lg inline-block shadow-2xl"
      animate={{
        boxShadow: [
          "0 0 20px rgba(255,255,255,0.1)",
          "0 0 40px rgba(255,255,255,0.2)",
          "0 0 20px rgba(255,255,255,0.1)",
        ],
      }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <img
        src={winner.image}
        alt={winner.name}
        className="w-96 h-96 object-cover rounded-lg shadow-lg"
      />
      <h3 className="text-3xl font-bold mt-6">{winner.name}</h3>
      <div className="text-gray-400 mt-2">#{winner.mint.slice(-4)}</div>
    </motion.div>
  </motion.div>
);

export default Tournament;
