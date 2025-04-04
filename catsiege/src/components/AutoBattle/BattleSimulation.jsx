import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { STATS } from "./constants";
import BattleCharacter from "./BattleCharacter";
import BattleAction from "./BattleAction";
import DiceRollBattle from "./DiceRollBattle";
import BattleEffects, { EFFECT_TYPES } from "./BattleEffects";
import ItemShowcase from "./ItemShowcase";
import BattleLog from "./BattleLog";

const BattleSimulation = ({
  playerItems,
  enemyItems,
  playerStats,
  enemyStats,
  battleLog,
  setBattleLog,
  setWinner,
  onBattleComplete,
  onSimulateBattle,
}) => {
  // Battle sequence states
  const [showItemShowcase, setShowItemShowcase] = useState(true);
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [isBattleInProgress, setIsBattleInProgress] = useState(false);

  // Dice rolling state
  const [playerDiceRoll, setPlayerDiceRoll] = useState(0);
  const [enemyDiceRoll, setEnemyDiceRoll] = useState(0);
  const [initiativeWinner, setInitiativeWinner] = useState(null);
  const [battleStarted, setBattleStarted] = useState(false);

  // Battle animation states
  const [currentLogIndex, setCurrentLogIndex] = useState(-1); // Start at -1 to indicate dice rolling phase
  const [displayedLog, setDisplayedLog] = useState([]);
  const [currentAction, setCurrentAction] = useState("");
  const [isActionVisible, setIsActionVisible] = useState(false);

  // Character states
  const [playerHealth, setPlayerHealth] = useState(playerStats[STATS.HEALTH]);
  const [enemyHealth, setEnemyHealth] = useState(enemyStats[STATS.HEALTH]);
  const [isPlayerAttacking, setIsPlayerAttacking] = useState(false);
  const [isEnemyAttacking, setIsEnemyAttacking] = useState(false);
  const [playerEffect, setPlayerEffect] = useState(null);
  const [enemyEffect, setEnemyEffect] = useState(null);

  // Add state to track next action and battle speed
  const [nextAction, setNextAction] = useState("");
  const [battleSpeed, setBattleSpeed] = useState("normal"); // normal, fast

  // Calculate actual duration based on battle speed
  const getActionDuration = () => {
    return battleSpeed === "fast" ? 0.7 : 1.2;
  };

  // Calculate actual animation delay based on battle speed
  const getAnimationDelay = () => {
    return battleSpeed === "fast" ? 300 : 500;
  };

  // Toggle battle speed
  const toggleBattleSpeed = () => {
    setBattleSpeed((prev) => (prev === "normal" ? "fast" : "normal"));
  };

  // Handle item showcase complete - proceed to dice roll
  const handleItemShowcaseComplete = () => {
    setShowItemShowcase(false);
    setIsRollingDice(true);
  };

  // Generate dice roll for initiative
  const rollDice = useCallback(() => {
    const playerRoll = Math.floor(Math.random() * 6) + 1;
    const enemyRoll = Math.floor(Math.random() * 6) + 1;

    setPlayerDiceRoll(playerRoll);
    setEnemyDiceRoll(enemyRoll);

    if (playerRoll > enemyRoll) {
      setInitiativeWinner("player");
    } else if (enemyRoll > playerRoll) {
      setInitiativeWinner("enemy");
    } else {
      // Tie, roll again after a delay
      setTimeout(() => rollDice(), 2500);
    }
  }, []);

  // Initialize dice rolling when it's time to roll
  useEffect(() => {
    if (isRollingDice && !initiativeWinner) {
      rollDice();
    }
  }, [isRollingDice, initiativeWinner, rollDice]);

  // Handle dice roll completion
  const handleDiceRollComplete = () => {
    // Only proceed if we have a winner
    if (initiativeWinner) {
      setIsRollingDice(false);
      setIsBattleInProgress(true);

      // Start the battle simulation
      if (onSimulateBattle && !battleStarted) {
        setBattleStarted(true);
        onSimulateBattle(initiativeWinner === "player");
      }
    }
  };

  // When battleLog is updated from the parent, start the battle visualization
  useEffect(() => {
    if (!isBattleInProgress || battleLog.length === 0 || !battleStarted) return;

    // Start battle with first log entry
    setCurrentLogIndex(0);
    setDisplayedLog([]);
    setCurrentAction(battleLog[0]);
    setIsActionVisible(true);
  }, [battleLog, isBattleInProgress, battleStarted]);

  // Check if the log entry mentions an item icon and use it for the effect
  const extractItemIcon = (logEntry) => {
    // Check multiple patterns that might contain item icons
    const patterns = [
      /with ([^\s]+) for/, // "with 🗡️ for"
      /with ([^\s]+),/, // "with 🗡️,"
      /([^\s]+) glows/, // "🗡️ glows"
      /([^\s]+) strikes/, // "🗡️ strikes"
      /Using ([^\s]+),/, // "Using 🗡️,"
      /([^\s]+) deals/, // "🗡️ deals"
    ];

    for (const pattern of patterns) {
      const match = logEntry.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  };

  // Update useEffect for battle log processing to be faster and provide next action
  useEffect(() => {
    if (
      !isBattleInProgress ||
      currentLogIndex < 0 ||
      currentLogIndex >= battleLog.length
    )
      return;

    // Get current log entry
    const logEntry = battleLog[currentLogIndex];

    // Update displayed action
    setCurrentAction(logEntry);
    setIsActionVisible(true);

    // Set next action (if available)
    if (currentLogIndex + 1 < battleLog.length) {
      setNextAction(battleLog[currentLogIndex + 1]);
    } else {
      setNextAction("");
    }

    // Parse and trigger animations based on log content
    if (
      logEntry.includes("Player attacks") ||
      logEntry.includes("Player lands a CRITICAL") ||
      (logEntry.includes("Player") && logEntry.includes("strikes")) ||
      (logEntry.includes("Player") && logEntry.includes("Using"))
    ) {
      setIsPlayerAttacking(true);

      // Extract item icon
      const itemIcon = extractItemIcon(logEntry);

      // Show appropriate effect on enemy
      if (logEntry.includes("CRITICAL")) {
        setEnemyEffect({ type: EFFECT_TYPES.CRITICAL });
      } else if (itemIcon) {
        // If an item icon is found, show the item use effect
        setEnemyEffect({ type: EFFECT_TYPES.ITEM_USE, icon: itemIcon });
      } else {
        setEnemyEffect({ type: EFFECT_TYPES.ATTACK });
      }

      // Reset after animation - faster
      setTimeout(
        () => {
          setIsPlayerAttacking(false);
          setEnemyEffect(null);
        },
        battleSpeed === "fast" ? 600 : 1000
      );
    } else if (
      logEntry.includes("Enemy attacks") ||
      logEntry.includes("Enemy lands a CRITICAL") ||
      (logEntry.includes("Enemy") && logEntry.includes("strikes")) ||
      (logEntry.includes("Enemy") && logEntry.includes("Using"))
    ) {
      setIsEnemyAttacking(true);

      // Extract item icon
      const itemIcon = extractItemIcon(logEntry);

      // Show appropriate effect on player
      if (logEntry.includes("CRITICAL")) {
        setPlayerEffect({ type: EFFECT_TYPES.CRITICAL });
      } else if (itemIcon) {
        // If an item icon is found, show the item use effect
        setPlayerEffect({ type: EFFECT_TYPES.ITEM_USE, icon: itemIcon });
      } else {
        setPlayerEffect({ type: EFFECT_TYPES.ATTACK });
      }

      // Reset after animation - faster
      setTimeout(
        () => {
          setIsEnemyAttacking(false);
          setPlayerEffect(null);
        },
        battleSpeed === "fast" ? 600 : 1000
      );
    } else if (logEntry.includes("Player evaded")) {
      setPlayerEffect({ type: EFFECT_TYPES.EVADE });

      // Reset after animation - faster
      setTimeout(
        () => {
          setPlayerEffect(null);
        },
        battleSpeed === "fast" ? 600 : 1000
      );
    } else if (logEntry.includes("Enemy evaded")) {
      setEnemyEffect({ type: EFFECT_TYPES.EVADE });

      // Reset after animation - faster
      setTimeout(
        () => {
          setEnemyEffect(null);
        },
        battleSpeed === "fast" ? 600 : 1000
      );
    }

    // Update health values
    if (logEntry.includes("Player health:")) {
      try {
        // Extract the health value using a regex
        const healthMatch = logEntry.match(/Player health: (\d+)/);
        if (healthMatch && healthMatch[1]) {
          const healthValue = parseInt(healthMatch[1], 10);
          console.log("Updating player health to:", healthValue);

          // Show damage effect if health decreased
          if (healthValue < playerHealth) {
            setPlayerEffect({
              type: EFFECT_TYPES.DAMAGE,
              value: playerHealth - healthValue,
            });
            setTimeout(
              () => setPlayerEffect(null),
              battleSpeed === "fast" ? 600 : 1000
            );
          }

          setPlayerHealth(healthValue);
        }
      } catch (err) {
        console.error("Error parsing player health:", err, logEntry);
      }
    } else if (logEntry.includes("Enemy health:")) {
      try {
        // Extract the health value using a regex
        const healthMatch = logEntry.match(/Enemy health: (\d+)/);
        if (healthMatch && healthMatch[1]) {
          const healthValue = parseInt(healthMatch[1], 10);
          console.log("Updating enemy health to:", healthValue);

          // Show damage effect if health decreased
          if (healthValue < enemyHealth) {
            setEnemyEffect({
              type: EFFECT_TYPES.DAMAGE,
              value: enemyHealth - healthValue,
            });
            setTimeout(
              () => setEnemyEffect(null),
              battleSpeed === "fast" ? 600 : 1000
            );
          }

          setEnemyHealth(healthValue);
        }
      } catch (err) {
        console.error("Error parsing enemy health:", err, logEntry);
      }
    }

    // Add the log entry to displayed log
    setDisplayedLog((prev) => [...prev, logEntry]);

    // Move to next log entry after a shorter delay
    const actionDuration = battleSpeed === "fast" ? 1200 : 1800;

    const timer = setTimeout(() => {
      // Hide current action before showing next
      setIsActionVisible(false);

      // Wait for action to fade out before proceeding - faster
      setTimeout(() => {
        if (currentLogIndex + 1 < battleLog.length) {
          setCurrentLogIndex((prev) => prev + 1);
        } else if (onBattleComplete) {
          // Battle complete
          onBattleComplete();
        }
      }, getAnimationDelay());
    }, actionDuration);

    return () => clearTimeout(timer);
  }, [
    battleLog,
    currentLogIndex,
    enemyHealth,
    isBattleInProgress,
    onBattleComplete,
    playerHealth,
    battleSpeed,
  ]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Item Showcase before battle */}
      <ItemShowcase
        playerItems={playerItems}
        enemyItems={enemyItems}
        playerStats={playerStats}
        enemyStats={enemyStats}
        isVisible={showItemShowcase}
        onComplete={handleItemShowcaseComplete}
      />

      {/* Dice Roll overlay */}
      <DiceRollBattle
        playerRoll={playerDiceRoll}
        enemyRoll={enemyDiceRoll}
        isRolling={isRollingDice}
        onComplete={handleDiceRollComplete}
      />

      {/* Battle arena */}
      <div className="bg-[#2a2924] border border-[#FFF5E4]/20 rounded-lg p-6 mb-6 h-[500px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-[#FBE294]">
            {showItemShowcase
              ? "PREPARING FOR BATTLE"
              : isRollingDice
              ? "ROLLING FOR INITIATIVE"
              : "BATTLE IN PROGRESS"}
          </h2>

          {/* Speed toggle button */}
          {isBattleInProgress && (
            <motion.button
              onClick={toggleBattleSpeed}
              className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                battleSpeed === "fast"
                  ? "bg-[#FBE294] text-[#1d1c19]"
                  : "bg-[#1d1c19] text-[#FBE294]"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {battleSpeed === "fast" ? "⚡ Fast Mode" : "🐢 Normal Mode"}
            </motion.button>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative">
          {/* Player Character */}
          <div className="w-full md:w-5/12">
            <BattleCharacter
              type="player"
              health={playerHealth}
              maxHealth={playerStats[STATS.HEALTH]}
              isAttacking={isPlayerAttacking}
              effect={playerEffect}
              items={playerItems}
            />
          </div>

          {/* VS Divider */}
          <div className="w-full md:w-2/12 flex justify-center items-center py-4">
            <div className="h-20 md:h-40 w-px bg-[#FFF5E4]/20 hidden md:block"></div>
            <div className="md:absolute md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 bg-[#333] rounded-full w-10 h-10 flex items-center justify-center text-[#FBE294] font-bold">
              VS
            </div>
            <div className="h-20 md:h-40 w-px bg-[#FFF5E4]/20 hidden md:block"></div>
          </div>

          {/* Enemy Character */}
          <div className="w-full md:w-5/12">
            <BattleCharacter
              type="enemy"
              health={enemyHealth}
              maxHealth={enemyStats[STATS.HEALTH]}
              isAttacking={isEnemyAttacking}
              effect={enemyEffect}
              items={enemyItems}
            />
          </div>
        </div>

        {/* Current action display */}
        <AnimatePresence>
          {isActionVisible && (
            <BattleAction
              action={currentAction}
              nextAction={nextAction}
              key={currentLogIndex}
              isVisible={isActionVisible}
              duration={getActionDuration()}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Battle Log */}
      <BattleLog logs={displayedLog} />
    </div>
  );
};

export default BattleSimulation;
