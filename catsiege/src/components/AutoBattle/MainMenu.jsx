import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Info, Gamepad, Swords, Medal, BadgePlus } from "lucide-react";

const MainMenu = ({ onStartGame }) => {
  const [showRules, setShowRules] = useState(false);
  const [activeTab, setActiveTab] = useState("howToPlay");

  const toggleRules = () => {
    setShowRules(!showRules);
  };

  return (
    <div className="min-h-screen w-full bg-[#1d1c19] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-[#2a2924] border-2 border-[#FFF5E4]/10 rounded-lg p-8 shadow-lg relative"
      >
        {/* Game Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#FBE294] mb-3">CATSIEGE</h1>
          <div className="flex justify-center space-x-6 mb-2">
            <span className="text-5xl">🐱</span>
            <span className="text-5xl">⚔️</span>
            <span className="text-5xl">🐰</span>
          </div>
          <p className="text-[#FFF5E4]/70 mt-4 max-w-md mx-auto">
            Enter the battlefield in the eternal struggle between cats and
            rabbits. Choose your items wisely and may fortune favor your blade!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStartGame}
            className="bg-gradient-to-r from-amber-600 to-amber-500 text-black font-bold py-4 px-6 rounded-lg flex items-center justify-center transition-all shadow-[0_0_15px_rgba(251,226,148,0.3)]"
          >
            <Swords className="mr-2 w-6 h-6" />
            PLAY NOW
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={toggleRules}
            className="bg-[#FFF5E4]/10 hover:bg-[#FFF5E4]/15 text-[#FFF5E4] font-bold py-3 px-6 rounded-lg flex items-center justify-center transition-all"
          >
            <Info className="mr-2 w-5 h-5" />
            GAME RULES & INFO
          </motion.button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-3 left-3 text-[#FFF5E4]/20 text-xl">✧</div>
        <div className="absolute bottom-3 right-3 text-[#FFF5E4]/20 text-xl">
          ✧
        </div>

        {/* Rules Modal */}
        {showRules && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={toggleRules}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-[#2a2924] border-2 border-[#FFF5E4]/10 rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={toggleRules}
                className="absolute top-4 right-4 p-2 rounded-full bg-[#FFF5E4]/10 hover:bg-[#FFF5E4]/20 transition-colors"
                aria-label="Close rules"
                tabIndex="0"
              >
                <X className="w-5 h-5 text-[#FFF5E4]/70" />
              </button>

              <h2 className="text-3xl font-bold text-[#FBE294] mb-6 text-center">
                Game Rules & Information
              </h2>

              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setActiveTab("howToPlay")}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    activeTab === "howToPlay"
                      ? "bg-amber-600 text-black"
                      : "bg-[#1d1c19] text-[#FFF5E4]/70 hover:bg-[#1d1c19]/80"
                  }`}
                >
                  <Gamepad className="w-4 h-4 mr-2" />
                  How To Play
                </button>
                <button
                  onClick={() => setActiveTab("items")}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    activeTab === "items"
                      ? "bg-amber-600 text-black"
                      : "bg-[#1d1c19] text-[#FFF5E4]/70 hover:bg-[#1d1c19]/80"
                  }`}
                >
                  <BadgePlus className="w-4 h-4 mr-2" />
                  Items
                </button>
                <button
                  onClick={() => setActiveTab("victory")}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    activeTab === "victory"
                      ? "bg-amber-600 text-black"
                      : "bg-[#1d1c19] text-[#FFF5E4]/70 hover:bg-[#1d1c19]/80"
                  }`}
                >
                  <Medal className="w-4 h-4 mr-2" />
                  Victory Conditions
                </button>
              </div>

              {/* Tab Content */}
              <div className="text-[#FFF5E4] space-y-6">
                {activeTab === "howToPlay" && (
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">🎲</span>
                      <p>
                        <strong className="text-[#FBE294]">
                          Turn-Based Combat:
                        </strong>{" "}
                        CatSiege is a turn-based auto-battle game inspired by
                        quick sit-and-go games. Each battle is short but
                        exciting!
                      </p>
                    </div>
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">👊</span>
                      <p>
                        <strong className="text-[#FBE294]">Dice Rolls:</strong>{" "}
                        At the start of combat, both you and the CPU roll a
                        dice. The higher roll determines who strikes first, then
                        turns alternate.
                      </p>
                    </div>
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">🎭</span>
                      <p>
                        <strong className="text-[#FBE294]">Auto-Battle:</strong>{" "}
                        Once combat begins, the battle plays out automatically
                        based on your selected items and their stats.
                      </p>
                    </div>
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">🎮</span>
                      <p>
                        <strong className="text-[#FBE294]">
                          Item Selection:
                        </strong>{" "}
                        Before each battle, you'll select 3 items from a random
                        selection of 6 to equip your character.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "items" && (
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">🗃️</span>
                      <p>
                        <strong className="text-[#FBE294]">
                          Item Collection:
                        </strong>{" "}
                        CatSiege features a collection of 32 unique items themed
                        around the eternal battle between cats and rabbits.
                      </p>
                    </div>
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">🎯</span>
                      <p>
                        <strong className="text-[#FBE294]">
                          Random Selection:
                        </strong>{" "}
                        Each game randomly selects 6 items from the pool,
                        ensuring every match feels unique and fresh.
                      </p>
                    </div>
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">⚔️</span>
                      <p>
                        <strong className="text-[#FBE294]">Item Types:</strong>{" "}
                        Items are divided into three categories - Weapons,
                        Armor, and Relics. Each provides different stat boosts.
                      </p>
                    </div>
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">✨</span>
                      <p>
                        <strong className="text-[#FBE294]">Rarities:</strong>{" "}
                        Items come in different rarities (Common, Uncommon,
                        Rare, Epic, Legendary) with increasing power levels.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "victory" && (
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">❤️</span>
                      <p>
                        <strong className="text-[#FBE294]">
                          Health Depletion:
                        </strong>{" "}
                        The battle continues until either your character or the
                        opponent's health reaches zero.
                      </p>
                    </div>
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">🏆</span>
                      <p>
                        <strong className="text-[#FBE294]">Victory:</strong>{" "}
                        Defeat your opponent by reducing their health to zero
                        before yours is depleted.
                      </p>
                    </div>
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">⚡</span>
                      <p>
                        <strong className="text-[#FBE294]">Strategy:</strong>{" "}
                        Choose items that complement each other for the best
                        chance of victory. Balance offense, defense, and
                        utility.
                      </p>
                    </div>
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">🔄</span>
                      <p>
                        <strong className="text-[#FBE294]">
                          Replayability:
                        </strong>{" "}
                        With different item combinations each game, no two
                        battles will be the same!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default MainMenu;
