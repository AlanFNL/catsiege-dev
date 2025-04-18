import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ITEM_POOL,
  ITEMS_PER_POOL,
  ITEMS_TO_SELECT,
  BASE_STATS,
  STATS,
} from "./constants";
import ItemCard from "./ItemCard";
import BattleSimulation from "./BattleSimulation";
import GameHeader from "./GameHeader";
import BattleLog from "./BattleLog";
import MainMenu from "./MainMenu";
import BattleResults from "./BattleResults";
import BattlePreparation from "./BattlePreparation";
import { useAuth } from "../../contexts/AuthContext";

const AutoBattleGame = () => {
  const { user, refreshUser } = useAuth();
  const [gameState, setGameState] = useState("menu"); // menu, preparation, selection, battle, results
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [revealedItems, setRevealedItems] = useState([]); // Track which items are revealed
  const [allItemsRevealed, setAllItemsRevealed] = useState(false); // Track if all items should be revealed
  const [enemyItems, setEnemyItems] = useState([]);
  const [battleLog, setBattleLog] = useState([]);
  const [winner, setWinner] = useState(null);
  const [playerStats, setPlayerStats] = useState({ ...BASE_STATS });
  const [enemyStats, setEnemyStats] = useState({ ...BASE_STATS });
  const [playerGoesFirst, setPlayerGoesFirst] = useState(null); // null, true, or false
  const [isFlippingComplete, setIsFlippingComplete] = useState(false);
  const [battleHistory, setBattleHistory] = useState([]);

  // Initialize the game with random items
  useEffect(() => {
    if (gameState === "selection") {
      initializeGame();
    }
  }, [gameState]);

  // Watch for changes in selected items to update player stats
  useEffect(() => {
    if (selectedItems.length > 0) {
      calculatePlayerStats();
    }
  }, [selectedItems]);

  // Watch for when 3 items are selected to reveal all cards
  useEffect(() => {
    if (selectedItems.length === ITEMS_TO_SELECT) {
      // Wait for final flip animation to complete before revealing all
      setTimeout(() => {
        setIsFlippingComplete(true);
        // Short delay before showing all cards
        setTimeout(() => {
          setAllItemsRevealed(true);
        }, 500);
      }, 1200);
    }
  }, [selectedItems]);

  const initializeGame = () => {
    // Reset game state
    setSelectedItems([]);
    setRevealedItems([]);
    setAllItemsRevealed(false);
    setIsFlippingComplete(false);
    setBattleLog([]);
    setWinner(null);
    setPlayerGoesFirst(null);

    // Randomly select items for the available pool
    const shuffled = [...ITEM_POOL].sort(() => 0.5 - Math.random());
    const randomItems = shuffled.slice(0, ITEMS_PER_POOL);
    setAvailableItems(randomItems);

    // Reset player stats
    setPlayerStats({ ...BASE_STATS });

    // Generate enemy items and stats
    generateEnemyLoadout();
  };

  const handleStartGame = () => {
    // Now goes to preparation screen instead of directly to selection
    setGameState("preparation");
  };

  const handleStartBattle = () => {
    // Called from BattlePreparation when user pays entry fee
    setGameState("selection");
  };

  const handleViewBattleHistory = (result) => {
    // Add the new battle result to history if provided
    if (result) {
      setBattleHistory((prev) => [result, ...prev]);
    }

    // Could navigate to battle history page or show a modal
  };

  const generateEnemyLoadout = () => {
    // Randomly select enemy items
    const shuffled = [...ITEM_POOL].sort(() => 0.5 - Math.random());
    const enemyRandomItems = shuffled.slice(0, ITEMS_TO_SELECT);
    setEnemyItems(enemyRandomItems);

    // Calculate enemy stats based on items
    let newEnemyStats = { ...BASE_STATS };

    // Apply item bonuses
    enemyRandomItems.forEach((item) => {
      Object.entries(item.stats).forEach(([statType, value]) => {
        // Apply rarity multiplier to the stat value
        const rarityMultiplier = item.rarity.multiplier || 1;
        const adjustedValue = Math.round(value * rarityMultiplier);

        if (newEnemyStats[statType] !== undefined) {
          newEnemyStats[statType] += adjustedValue;
        }
      });
    });

    setEnemyStats(newEnemyStats);
  };

  const calculatePlayerStats = () => {
    // Start with base stats
    let newPlayerStats = { ...BASE_STATS };

    // Apply item bonuses
    selectedItems.forEach((item) => {
      Object.entries(item.stats).forEach(([statType, value]) => {
        // Apply rarity multiplier to the stat value
        const rarityMultiplier = item.rarity.multiplier || 1;
        const adjustedValue = Math.round(value * rarityMultiplier);

        if (newPlayerStats[statType] !== undefined) {
          newPlayerStats[statType] += adjustedValue;
        }
      });
    });

    setPlayerStats(newPlayerStats);
  };

  // Process a single attack in the battle
  const processAttack = (
    attackerName,
    defenderName,
    attackerStats,
    defenderStats,
    log,
    attackerItems,
    turn
  ) => {
    // Roll for critical hit
    const criticalChance = attackerStats[STATS.CRITICAL] || 5; // Default 5% if not set
    const isCritical = Math.random() * 100 <= criticalChance;

    // Roll for evasion
    const evasionChance = defenderStats[STATS.EVASION] || 5; // Default 5% if not set
    const isEvaded = Math.random() * 100 <= evasionChance;

    if (isEvaded) {
      log.push(`${defenderName} evaded ${attackerName}'s attack!`);
      return;
    }

    // Calculate base damage
    let damage = Math.max(
      1,
      attackerStats[STATS.ATTACK] - defenderStats[STATS.DEFENSE] / 2
    );

    // Apply critical multiplier if applicable
    if (isCritical) {
      damage = Math.round(damage * 1.5);
      log.push(
        `CRITICAL HIT! ${attackerName} lands a powerful blow for ${damage} damage!`
      );
    } else {
      log.push(`${attackerName} attacks for ${damage} damage.`);
    }

    // Apply damage
    defenderStats[STATS.HEALTH] = Math.max(
      0,
      defenderStats[STATS.HEALTH] - damage
    );

    // Report remaining health
    log.push(
      `${defenderName} health: ${defenderStats[STATS.HEALTH]}/${
        BASE_STATS[STATS.HEALTH]
      }`
    );

    // Check for defeat
    if (defenderStats[STATS.HEALTH] <= 0) {
      log.push(`${defenderName} has been defeated!`);
      log.push(`${attackerName} is VICTORIOUS!`);
    }
  };

  const handleItemSelect = (item) => {
    // Only allow selection if we haven't reached the limit
    if (selectedItems.length >= ITEMS_TO_SELECT) return;

    // Only allow selection of items that haven't been revealed yet
    if (revealedItems.includes(item.id)) return;

    // Add to selected items and mark as revealed
    setSelectedItems([...selectedItems, item]);
    setRevealedItems([...revealedItems, item.id]);
  };

  const startBattle = () => {
    if (selectedItems.length !== ITEMS_TO_SELECT) {
      return; // Don't start battle unless all items are selected
    }

    // Switch to battle state
    setGameState("battle");

    // Reset battle log
    setBattleLog([]);
  };

  const handleBattleComplete = () => {
    // Move to results state after battle concludes
    setGameState("results");
  };

  const simulateBattle = (isPlayerFirst) => {
    // Store who goes first for the battle log
    setPlayerGoesFirst(isPlayerFirst);

    const log = [];

    // Clone stats to avoid modifying the originals during battle
    let playerCurrentStats = { ...playerStats };
    let enemyCurrentStats = { ...enemyStats };

    log.push("The battle begins...");

    // Add dice roll outcome to the log
    if (isPlayerFirst) {
      log.push("Player won the initiative roll and goes first!");
    } else {
      log.push("Enemy won the initiative roll and goes first!");
    }

    // Continue battle until someone's health reaches 0
    let turn = 1;
    while (
      playerCurrentStats[STATS.HEALTH] > 0 &&
      enemyCurrentStats[STATS.HEALTH] > 0
    ) {
      log.push(`--- Turn ${turn} ---`);

      // Use the initiative result rather than speed to determine first attacker
      // Only for first turn, subsequent turns use speed
      const playerFirst =
        turn === 1
          ? isPlayerFirst
          : playerCurrentStats[STATS.SPEED] >= enemyCurrentStats[STATS.SPEED];

      if (playerFirst) {
        // Player attacks
        processAttack(
          "Player",
          "Enemy",
          playerCurrentStats,
          enemyCurrentStats,
          log,
          selectedItems,
          turn
        );

        // If enemy still alive, enemy attacks
        if (enemyCurrentStats[STATS.HEALTH] > 0) {
          processAttack(
            "Enemy",
            "Player",
            enemyCurrentStats,
            playerCurrentStats,
            log,
            enemyItems,
            turn
          );
        }
      } else {
        // Enemy attacks
        processAttack(
          "Enemy",
          "Player",
          enemyCurrentStats,
          playerCurrentStats,
          log,
          enemyItems,
          turn
        );

        // If player still alive, player attacks
        if (playerCurrentStats[STATS.HEALTH] > 0) {
          processAttack(
            "Player",
            "Enemy",
            playerCurrentStats,
            enemyCurrentStats,
            log,
            selectedItems,
            turn
          );
        }
      }

      // Check if battle is over
      if (
        playerCurrentStats[STATS.HEALTH] <= 0 ||
        enemyCurrentStats[STATS.HEALTH] <= 0
      ) {
        break;
      }

      turn++;
    }

    // Determine winner
    if (playerCurrentStats[STATS.HEALTH] <= 0) {
      setWinner("enemy");
    } else {
      setWinner("player");
    }

    // Update battle log
    setBattleLog(log);
  };

  const resetGame = () => {
    // Return to item selection to play again
    setGameState("preparation");
  };

  // Get the current number of selected items
  const selectedCount = selectedItems.length;

  return (
    <div className="bg-[#1d1c19] min-h-screen text-[#FFF5E4]">
      {gameState === "menu" && <MainMenu onStartGame={handleStartGame} />}

      {gameState !== "menu" && (
        <>
          <GameHeader
            gameState={gameState}
            selectedCount={selectedCount}
            requiredCount={ITEMS_TO_SELECT}
            onStartBattle={startBattle}
            onBackToMenu={() => setGameState("menu")}
            allItemsRevealed={allItemsRevealed}
          />

          {/* Preparation Phase */}
          {gameState === "preparation" && (
            <BattlePreparation
              onStartBattle={handleStartBattle}
              onViewBattleHistory={handleViewBattleHistory}
            />
          )}

          {/* Item Selection Phase */}
          {gameState === "selection" && (
            <div className="container mx-auto p-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#FBE294]">
                  Choose Your Items
                </h2>
                <p className="text-[#FFF5E4]/70">
                  Select {ITEMS_TO_SELECT} items to equip your character
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onSelect={() => handleItemSelect(item)}
                    isSelected={selectedItems.includes(item)}
                    isRevealed={
                      revealedItems.includes(item.id) || allItemsRevealed
                    }
                    canBeSelected={selectedItems.length < ITEMS_TO_SELECT}
                  />
                ))}
              </div>

              {isFlippingComplete && (
                <div className="mt-8 flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startBattle}
                    disabled={selectedItems.length !== ITEMS_TO_SELECT}
                    className={`px-6 py-3 rounded-lg font-bold text-lg ${
                      selectedItems.length === ITEMS_TO_SELECT
                        ? "bg-[#FBE294] text-[#1d1c19]"
                        : "bg-[#FBE294]/30 text-[#1d1c19]/60 cursor-not-allowed"
                    }`}
                  >
                    Battle!
                  </motion.button>
                </div>
              )}

              {selectedItems.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-[#FBE294] mb-4">
                    Selected Items
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {selectedItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        isSelected={true}
                        isRevealed={true}
                        isShowcaseMode={true}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Stats Preview */}
              {selectedItems.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-[#FBE294] mb-4">
                    Your Stats
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#2a2924] p-4 rounded-lg text-center">
                      <div className="text-[#FFF5E4]/70 text-sm">Health</div>
                      <div className="text-2xl font-bold text-red-400">
                        {playerStats[STATS.HEALTH]}
                      </div>
                    </div>
                    <div className="bg-[#2a2924] p-4 rounded-lg text-center">
                      <div className="text-[#FFF5E4]/70 text-sm">Attack</div>
                      <div className="text-2xl font-bold text-orange-400">
                        {playerStats[STATS.ATTACK]}
                      </div>
                    </div>
                    <div className="bg-[#2a2924] p-4 rounded-lg text-center">
                      <div className="text-[#FFF5E4]/70 text-sm">Defense</div>
                      <div className="text-2xl font-bold text-blue-400">
                        {playerStats[STATS.DEFENSE]}
                      </div>
                    </div>
                    <div className="bg-[#2a2924] p-4 rounded-lg text-center">
                      <div className="text-[#FFF5E4]/70 text-sm">Speed</div>
                      <div className="text-2xl font-bold text-green-400">
                        {playerStats[STATS.SPEED]}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Battle Phase */}
          {gameState === "battle" && (
            <BattleSimulation
              playerItems={selectedItems}
              enemyItems={enemyItems}
              playerStats={playerStats}
              enemyStats={enemyStats}
              onBattleComplete={handleBattleComplete}
              onSimulateBattle={simulateBattle}
              battleLog={battleLog}
              setBattleLog={setBattleLog}
              setWinner={setWinner}
            />
          )}

          {/* Results Phase */}
          {gameState === "results" && (
            <BattleResults
              winner={winner}
              playerItems={selectedItems}
              enemyItems={enemyItems}
              playerStats={playerStats}
              enemyStats={enemyStats}
              battleLog={battleLog}
              onPlayAgain={resetGame}
              onBackToMenu={() => setGameState("menu")}
              onBattleComplete={handleBattleComplete}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AutoBattleGame;
