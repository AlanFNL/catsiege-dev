import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Map dice numbers to dice emojis
const diceEmojis = {
  1: "⚀",
  2: "⚁",
  3: "⚂",
  4: "⚃",
  5: "⚄",
  6: "⚅",
};

const DiceRollBattle = ({ playerRoll, enemyRoll, onComplete, isRolling }) => {
  const [showResult, setShowResult] = useState(false);
  const [rollingEmojis, setRollingEmojis] = useState(["⚀", "⚁"]);

  // Animate dice rolling emojis
  useEffect(() => {
    if (!isRolling || showResult) return;

    const interval = setInterval(() => {
      const playerEmoji = diceEmojis[Math.floor(Math.random() * 6) + 1];
      const enemyEmoji = diceEmojis[Math.floor(Math.random() * 6) + 1];
      setRollingEmojis([playerEmoji, enemyEmoji]);
    }, 150);

    return () => clearInterval(interval);
  }, [isRolling, showResult]);

  useEffect(() => {
    if (!isRolling) return;

    // Animate dice rolling and then show result
    const timer = setTimeout(() => {
      setShowResult(true);

      // After showing the result for a moment, complete the dice rolling phase
      const completeTimer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 2000);

      return () => clearTimeout(completeTimer);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isRolling, onComplete]);

  // If not rolling dice, don't render
  if (!isRolling) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="bg-[#2a2924]/90 backdrop-blur-md p-8 rounded-xl border-2 border-[#FBE294]/30 max-w-md w-full"
        >
          <motion.h2
            className="text-2xl text-[#FBE294] text-center mb-8 font-bold"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="inline-block mr-3 text-4xl">🎲</span>
            Roll For Initiative!
            <span className="inline-block ml-3 text-4xl">🎲</span>
          </motion.h2>

          <div className="flex justify-between items-center gap-8 mb-10">
            {/* Player Side */}
            <div className="flex-1">
              <p className="text-[#FFF5E4] text-center mb-4 font-medium">
                Player
              </p>
              <motion.div
                initial={showResult ? { rotate: 0 } : { rotate: 0 }}
                animate={
                  showResult
                    ? { rotate: 0 }
                    : { rotate: [0, 360, 720, 1080, 1440, 1800] }
                }
                transition={{ duration: 2, ease: "easeOut" }}
                className="flex justify-center"
              >
                <div className="text-5xl bg-[#1d1c19] p-4 rounded-xl border-2 border-[#FBE294]/30 w-24 h-24 flex items-center justify-center shadow-lg shadow-[#FBE294]/10">
                  {showResult ? (
                    <>
                      <span className="text-6xl">{diceEmojis[playerRoll]}</span>
                      <span className="absolute bottom-1 right-2 text-lg text-[#FFF5E4]/50">
                        {playerRoll}
                      </span>
                    </>
                  ) : (
                    <span className="text-6xl animate-pulse">
                      {rollingEmojis[0]}
                    </span>
                  )}
                </div>
              </motion.div>
            </div>

            <div className="text-2xl text-[#FBE294] font-bold">VS</div>

            {/* Enemy Side */}
            <div className="flex-1">
              <p className="text-[#FFF5E4] text-center mb-4 font-medium">
                Enemy
              </p>
              <motion.div
                initial={showResult ? { rotate: 0 } : { rotate: 0 }}
                animate={
                  showResult
                    ? { rotate: 0 }
                    : { rotate: [0, -360, -720, -1080, -1440, -1800] }
                }
                transition={{ duration: 2, ease: "easeOut" }}
                className="flex justify-center"
              >
                <div className="text-5xl bg-[#1d1c19] p-4 rounded-xl border-2 border-[#FBE294]/30 w-24 h-24 flex items-center justify-center shadow-lg shadow-[#FBE294]/10">
                  {showResult ? (
                    <>
                      <span className="text-6xl">{diceEmojis[enemyRoll]}</span>
                      <span className="absolute bottom-1 right-2 text-lg text-[#FFF5E4]/50">
                        {enemyRoll}
                      </span>
                    </>
                  ) : (
                    <span className="text-6xl animate-pulse">
                      {rollingEmojis[1]}
                    </span>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              {playerRoll > enemyRoll ? (
                <p className="text-green-400 text-xl font-bold">
                  Player goes first!
                </p>
              ) : playerRoll < enemyRoll ? (
                <p className="text-red-400 text-xl font-bold">
                  Enemy goes first!
                </p>
              ) : (
                <p className="text-yellow-400 text-xl font-bold">
                  It's a tie! Rolling again...
                </p>
              )}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DiceRollBattle;
