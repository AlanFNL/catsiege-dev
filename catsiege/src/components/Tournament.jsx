import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import vid from "../assets/fight.webm";

function Tournament() {
  const [tournamentState, setTournamentState] = useState({
    currentRound: 0,
    brackets: [],
    currentMatch: null,
    winners: [],
    isRunning: false,
    roundSizes: [512, 256, 128, 64, 32, 16, 8, 4, 2, 1],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coinFlipResult, setCoinFlipResult] = useState(null);
  const [battleState, setBattleState] = useState({
    nft1: null,
    nft2: null,
  });
  const [hitInfo, setHitInfo] = useState(null);
  const [loadedImages, setLoadedImages] = useState(new Set());

  const socketRef = useRef();

  useEffect(() => {
    const SERVER_URL = "https://catsiege-dev.onrender.com";
    console.log("Connecting to server:", SERVER_URL);

    socketRef.current = io(SERVER_URL);

    socketRef.current.on("connect", () => {
      console.log("Connected to server");
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setError("Failed to connect to server");
      setIsLoading(false);
    });

    socketRef.current.on("tournamentState", (state) => {
      console.log("Received tournament state:", state);
      console.log("Tournament running:", state.isRunning);
      if (state.winners?.length > 0) {
        console.log("Winner:", state.winners[0]);
      }
      setTournamentState(state);
      if (state.currentMatch) {
        setBattleState({
          nft1: state.currentMatch.nft1,
          nft2: state.currentMatch.nft2,
        });
      }
      setIsLoading(false);
    });

    socketRef.current.on("error", (error) => {
      console.error("Socket error:", error);
      setError(error.message);
      setIsLoading(false);
    });

    socketRef.current.on("battleUpdate", ({ nft1, nft2 }) => {
      console.log("Battle update received:", { nft1, nft2 });
      setBattleState({ nft1, nft2 });
    });

    socketRef.current.on("coinFlip", (result) => {
      console.log("Coin flip result:", result);
      setCoinFlipResult(result);
      setTimeout(() => setCoinFlipResult(null), 3000);
    });

    socketRef.current.on("nftHit", (data) => {
      console.log("Hit event received:", data);
      setHitInfo(data);
      // Reset hit info after animation
      setTimeout(() => setHitInfo(null), 1000);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (battleState.nft1?.image && battleState.nft2?.image) {
      const preloadImages = async () => {
        const images = [battleState.nft1.image, battleState.nft2.image];

        await Promise.all(
          images.map((src) => {
            if (!loadedImages.has(src)) {
              return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = src;
                img.onload = () => {
                  setLoadedImages((prev) => new Set([...prev, src]));
                  resolve();
                };
                img.onerror = reject;
              });
            }
            return Promise.resolve();
          })
        );
      };

      preloadImages();
    }
  }, [battleState.nft1?.image, battleState.nft2?.image]);

  const initializeTournament = () => {
    console.log("Initializing tournament...");
    setIsLoading(true);
    setError(null);
    socketRef.current.emit("initializeTournament");
  };

  return (
    <div className="min-h-screen relative bg-black text-white">
      {/* Video Background */}
      <video
        autoPlay
        src={vid}
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      ></video>

      {/* Content Container with overlay */}
      <div className="relative z-10 p-8">
        <AnimatePresence>
          {coinFlipResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            >
              <CoinFlip
                winner={coinFlipResult.winner}
                loser={coinFlipResult.loser}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-8">NFT Tournament</h1>

          {error && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin text-4xl mb-4">⚡</div>
              <p>Loading tournament status...</p>
            </div>
          ) : (
            <>
              {!tournamentState.isRunning &&
                !tournamentState.winners?.length &&
                tournamentState.brackets.length === 0 && (
                  <button
                    onClick={initializeTournament}
                    disabled={isLoading}
                    className={`${
                      isLoading
                        ? "bg-gray-600"
                        : "bg-blue-600 hover:bg-blue-700"
                    } px-6 py-2 rounded-lg transition-colors relative`}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <span className="animate-spin mr-2">⚡</span>
                        Loading NFTs...
                      </div>
                    ) : (
                      "Start Tournament"
                    )}
                  </button>
                )}

              {tournamentState.isRunning && tournamentState.currentMatch && (
                <div className="mb-8">
                  <h2 className="text-2xl mb-4">Current Battle</h2>
                  <div className="flex justify-center gap-8 items-center">
                    <BattleCard
                      nft={
                        battleState.nft1 || tournamentState.currentMatch.nft1
                      }
                      isAttacker={
                        coinFlipResult?.winner?.mint === battleState.nft1?.mint
                      }
                      hitInfo={hitInfo}
                    />
                    <motion.div className="text-4xl flex items-center font-bold">
                      VS
                    </motion.div>
                    <BattleCard
                      nft={
                        battleState.nft2 || tournamentState.currentMatch.nft2
                      }
                      isAttacker={
                        coinFlipResult?.winner?.mint === battleState.nft2?.mint
                      }
                      hitInfo={hitInfo}
                    />
                  </div>
                </div>
              )}

              {tournamentState.isRunning && (
                <div className="mt-8">
                  <h2 className="text-2xl mb-4">
                    Round {tournamentState.currentRound + 1} - Remaining:{" "}
                    {
                      tournamentState.brackets[tournamentState.currentRound]
                        ?.length
                    }
                  </h2>
                  <div className="max-h-[600px] overflow-y-auto rounded-lg border border-gray-700 p-4">
                    <div className="grid grid-cols-4 gap-4">
                      <AnimatePresence>
                        {tournamentState.brackets[
                          tournamentState.currentRound
                        ]?.map((nft) => (
                          <NFTCard
                            key={nft.id}
                            nft={nft}
                            isActive={
                              nft.mint === battleState.nft1?.mint ||
                              nft.mint === battleState.nft2?.mint
                            }
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              )}

              {!tournamentState.isRunning &&
                tournamentState.winners?.length > 0 && (
                  <>
                    <WinnerDisplay winner={tournamentState.winners[0]} />
                    <button
                      onClick={initializeTournament}
                      className="mt-8 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors"
                    >
                      Start New Tournament
                    </button>
                  </>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper components
const BattleCard = ({ nft, isAttacker, hitInfo }) => {
  const [wasHit, setWasHit] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const prevHealth = useRef(nft.health);
  const hitInfoRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (hitInfo && hitInfo !== hitInfoRef.current) {
      hitInfoRef.current = hitInfo;

      // Only show attack animation if this NFT is the attacker
      if (hitInfo.attacker.mint === nft.mint) {
        console.log(`${nft.name} is attacking!`);
        setIsAttacking(true);
        setTimeout(() => setIsAttacking(false), 1000);
      }

      // Only show hit animation if this NFT is the target AND health decreased
      if (
        hitInfo.target.mint === nft.mint &&
        hitInfo.target.health < prevHealth.current
      ) {
        console.log(
          `${nft.name} was hit! Health: ${prevHealth.current} -> ${hitInfo.target.health}`
        );
        setWasHit(true);
        setTimeout(() => setWasHit(false), 1000);
      }

      // Update previous health reference
      prevHealth.current = nft.health;
    }
  }, [hitInfo, nft.health, nft.mint, nft.name]);

  return (
    <motion.div
      className="bg-gray-900/70 backdrop-blur-md p-6 rounded-lg shadow-xl relative border border-gray-800"
      animate={
        wasHit
          ? {
              x: [-20, 20, -15, 15, -10, 10, -5, 5, 0],
              rotate: [-2, 2, -1.5, 1.5, -1, 1, -0.5, 0.5, 0],
            }
          : isAttacking
          ? {
              scale: [1, 1.1, 1],
              transition: { duration: 0.5 },
            }
          : {
              scale: [1, 1.02, 1],
              transition: { duration: 1.5, repeat: Infinity },
            }
      }
      transition={{ duration: 0.5 }}
    >
      {/* Sword Attack Animation */}
      <AnimatePresence>
        {isAttacking && (
          <motion.div
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 100 }}
            exit={{ opacity: 0 }}
            className="absolute z-10 left-full top-1/2 -translate-y-1/2"
          >
            <span className="text-4xl">⚔️</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hit Effect Flash */}
      <AnimatePresence>
        {wasHit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-500 mix-blend-overlay rounded-lg"
          />
        )}
      </AnimatePresence>

      {/* Battle Aura */}
      <motion.div
        className="absolute -inset-2 bg-gradient-to-r from-purple-900/30 to-red-900/30 rounded-lg blur-xl"
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <div className="relative">
        {!imageLoaded && (
          <motion.div
            className="absolute inset-0 bg-gray-900 rounded-lg flex items-center justify-center"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <span className="text-4xl">⚔️</span>
          </motion.div>
        )}
        <img
          src={nft.image}
          alt={nft.name}
          className={`w-64 h-64 object-cover rounded-lg shadow-lg transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          loading="eager"
        />

        {/* Power Particles */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-500 rounded-full"
              animate={{
                y: [-10, -50],
                x: Math.random() * 20 - 10,
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </motion.div>

        {/* Health Bar */}
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-4/5">
          <motion.div
            className="h-3 bg-gray-700 rounded-full overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-red-500 to-red-600"
              initial={{ width: "100%" }}
              animate={{ width: `${(nft.health / 2) * 100}%` }}
              transition={{ type: "spring", stiffness: 100 }}
            />
          </motion.div>
        </div>

        {/* Hit Indicator - Only show when this NFT is hit */}
        <AnimatePresence mode="wait">
          {wasHit && (
            <motion.div
              key="hit-indicator"
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 1, y: -50, scale: 1.5 }}
              exit={{ opacity: 0, y: -100, scale: 0.5 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500 font-bold text-4xl"
            >
              -1 HP!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Name and Stats */}
      <motion.div
        className="mt-6 text-center"
        animate={wasHit ? { y: [0, -5, 0] } : {}}
      >
        <h3 className="text-xl font-bold truncate">{nft.name}</h3>
        <div className="mt-2 flex justify-center items-center gap-2">
          <motion.span
            className="text-red-500"
            animate={wasHit ? { scale: [1, 1.5, 1] } : {}}
          >
            ❤️
          </motion.span>
          <motion.span
            className="font-mono"
            animate={wasHit ? { scale: [1, 1.2, 1] } : {}}
          >
            {nft.health}/2
          </motion.span>
        </div>
      </motion.div>

      {/* VS Lightning Effect */}
      <motion.div
        className="absolute top-1/2 right-0 transform translate-x-full -translate-y-1/2"
        animate={{
          opacity: [0, 1, 0],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="text-4xl text-yellow-400">⚡</div>
      </motion.div>
    </motion.div>
  );
};

const NFTPlaceholder = () => (
  <div className="w-full h-40 bg-gray-700 rounded-md animate-pulse flex items-center justify-center">
    <img
      src="/favicon3.png"
      alt="Placeholder"
      className="w-12 h-12 opacity-50 mx-auto mb-2"
    />
  </div>
);

const NFTCard = ({ nft, isActive = false }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    className="bg-gray-900/70 backdrop-blur-md p-3 rounded-lg shadow-md hover:shadow-xl transition-all border border-gray-800 hover:bg-gray-900/80"
  >
    <div className="relative">
      <div className="w-full h-40 bg-gray-800/50 rounded-md flex items-center justify-center">
        <div className="text-center">
          <img
            src="/favicon3.png"
            alt="Placeholder"
            className="w-12 h-12 opacity-40 mx-auto mb-2 filter drop-shadow-lg"
          />
          <span className="text-gray-400 text-sm">#{nft.mint?.slice(-4)}</span>
        </div>
      </div>
      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
        <span className="text-xs">❤️ {nft.health}</span>
      </div>
    </div>
    <div className="mt-2">
      <h3 className="text-sm font-medium truncate text-gray-300">{nft.name}</h3>
      <div className="text-xs text-gray-500 mt-1">
        #{nft.mint ? nft.mint.slice(-4) : "N/A"}
      </div>
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
      <div className="text-gray-400 mt-2">
        #{winner.mint ? winner.mint.slice(-4) : "N/A"}
      </div>
    </motion.div>
  </motion.div>
);

const CoinFlip = ({ winner, loser }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0 }}
    className="bg-black bg-opacity-90 p-8 rounded-lg text-center"
  >
    <motion.div
      animate={{ rotateY: 1080 }}
      transition={{ duration: 2 }}
      className="text-6xl mb-4"
    >
      🎲
    </motion.div>
    <motion.h3
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5 }}
      className="text-2xl font-bold text-yellow-400"
    >
      {winner.name} strikes first!
    </motion.h3>
  </motion.div>
);

export default Tournament;
