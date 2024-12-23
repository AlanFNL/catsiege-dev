import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import vid from "../assets/fight.webm";
import BattleWinnerAnimation from "./animations/BattleWinnerAnimation";

const CardParticles = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-purple-400/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `floatParticle ${
              2 + Math.random() * 2
            }s infinite ease-in-out ${Math.random() * 2}s`,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
};

const BattleCard = ({
  nft,
  isAttacker,
  hitInfo,
  battleKey,
  onImageLoad,
  showVideo = false,
  playSound,
}) => {
  const MAX_HEALTH = 32;

  // Safely handle nft prop
  if (!nft) {
    return null; // Or return a loading state
  }

  const [isDefeated, setIsDefeated] = useState(false);
  const [showWinnerAnimation, setShowWinnerAnimation] = useState(false);
  const [showHitEffect, setShowHitEffect] = useState(false);
  const [showAttackEffect, setShowAttackEffect] = useState(false);

  // Safely initialize health with proper fallbacks
  const [currentHealth, setCurrentHealth] = useState(() => {
    const initialHealth =
      nft?.battleHealth?.nft1 ||
      nft?.battleHealth?.nft2 ||
      nft?.health ||
      MAX_HEALTH;
    return Math.max(0, Math.min(initialHealth, MAX_HEALTH));
  });

  // Update health only from nft prop changes
  useEffect(() => {
    if (nft) {
      const newHealth =
        nft?.battleHealth?.nft1 ||
        nft?.battleHealth?.nft2 ||
        nft?.health ||
        MAX_HEALTH;
      const safeHealth = Math.max(0, Math.min(newHealth, MAX_HEALTH));
      setCurrentHealth(safeHealth);
      setIsDefeated(safeHealth <= 0);
    }
  }, [nft, nft?.health, nft?.battleHealth]);

  // Improved hit detection with null checks
  const isDefender = React.useMemo(() => {
    if (!hitInfo) return false;
    return (
      hitInfo.defender?.id === nft?.id ||
      hitInfo.target?.id === nft?.id ||
      hitInfo.defender?.name === nft?.name ||
      hitInfo.target?.name === nft?.name
    );
  }, [hitInfo, nft]);

  // Handle hit effects with proper checks
  useEffect(() => {
    if (isDefender && hitInfo?.damage >= 0) {
      setShowHitEffect(true);
      playSound?.("hit");

      // Calculate new health after hit
      const newHealth = currentHealth - hitInfo.damage;

      // Check for defeat and trigger winner animation
      if (newHealth <= 0) {
        setIsDefeated(true);
        // If this NFT is defeated, show winner animation on the attacker
        if (hitInfo.attacker && hitInfo.attacker.id !== nft.id) {
          setShowWinnerAnimation(false); // Make sure it's off for the defeated NFT
        }
      }

      const timer = setTimeout(() => setShowHitEffect(false), 1000);
      return () => clearTimeout(timer);
    }

    // Show winner animation on the attacker when they win
    if (isAttacker && hitInfo?.defender && hitInfo.defender.health <= 0) {
      setShowWinnerAnimation(true);
      setTimeout(() => setShowWinnerAnimation(false), 3000);
    }
  }, [
    hitInfo?.damage,
    nft?.name,
    isDefender,
    currentHealth,
    isAttacker,
    hitInfo?.defender,
  ]);

  // Calculate health percentage safely
  const healthPercentage = Math.max(
    0,
    Math.min(100, (currentHealth / MAX_HEALTH) * 100)
  );

  // Get hit type color and text - align with HitRollDisplay
  const getHitType = (damage) => {
    if (damage === 0) return { color: "text-red-400", text: "MISS!" };
    if (damage === 1) return { color: "text-yellow-400", text: "Light Hit!" };
    if (damage === 2) return { color: "text-orange-400", text: "Medium Hit!" };
    if (damage === 3) return { color: "text-green-400", text: "Critical Hit!" };
    return { color: "text-white", text: "Miss!" };
  };

  const hitType = getHitType(hitInfo?.damage);

  // Handle attack indicator
  useEffect(() => {
    if (isAttacker) {
      setShowAttackEffect(true);
      const timer = setTimeout(() => {
        setShowAttackEffect(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShowAttackEffect(false);
    }
  }, [isAttacker, hitInfo?.timestamp]);

  // Handle video effect
  useEffect(() => {
    if (showVideo) {
      const timer = setTimeout(() => {
        // Handle any cleanup needed after video plays
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showVideo]);

  return (
    <motion.div
      key={battleKey}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative"
    >
      {/* Video overlay */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-lg"
          >
            <video
              src={vid}
              autoPlay
              muted
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main card - Make sure position is relative and overflow is visible */}
      <motion.div
        className={`w-64 bg-gray-800 rounded-lg border-2
                    ${isAttacker ? "border-purple-500/50" : "border-gray-700"}
                    transition-colors duration-300 relative`}
        animate={{
          y: showHitEffect ? 0 : [-5, 5],
          x: showHitEffect ? [-5, 5, -5, 5, 0] : 0,
          scale: showHitEffect ? [1, 0.98, 1] : 1,
        }}
        transition={{
          y: {
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          },
          x: {
            duration: 0.4,
            ease: "easeInOut",
          },
          scale: {
            duration: 0.4,
            ease: "easeInOut",
          },
        }}
        style={{
          transform: "translate3d(0, 0, 0)",
          backfaceVisibility: "hidden",
        }}
      >
        {/* Add particles before other content */}
        <CardParticles />

        {/* NFT Image with grayscale filter for defeated state */}
        <div className="relative aspect-square">
          <img
            src={nft.image}
            alt={nft.name}
            className={`w-full h-full object-cover transition-all duration-500
                       ${isDefeated ? "grayscale brightness-50" : ""}`}
            onLoad={() => onImageLoad?.(nft.image)}
          />

          {/* Defeated overlay - only show when health is 0 or less */}
          {isDefeated && currentHealth <= 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-red-500 font-bold text-2xl">Defeated</span>
            </div>
          )}

          {/* Health Bar Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "100%" }}
                animate={{
                  width: `${healthPercentage}%`,
                  backgroundColor:
                    healthPercentage < 25 ? "#ef4444" : "#22c55e",
                }}
                className="h-full"
                transition={{
                  duration: 0.5,
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>
        </div>

        {/* NFT Info */}
        <div className="p-4 space-y-2">
          <div className="text-lg font-semibold text-white truncate">
            {nft.name}
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">HP:</span>
            <span
              className={`${
                healthPercentage < 25 ? "text-red-400" : "text-green-400"
              }`}
            >
              {currentHealth}/{MAX_HEALTH}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Hit Effect */}
      <AnimatePresence>
        {showHitEffect && hitInfo?.damage >= 0 && (
          <motion.div
            key={`hit-${Date.now()}`}
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: [-20, -40, -45, -50],
              scale: [0.5, 1.2, 1.2, 1],
            }}
            transition={{
              duration: 1,
              times: [0, 0.2, 0.8, 1],
              ease: "easeOut",
            }}
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                     font-bold text-3xl pointer-events-none z-20 flex flex-col items-center gap-1
                     ${hitType.color}`}
          >
            <div className="text-sm">{hitType.text}</div>
            {hitInfo.damage > 0 && (
              <div className="flex items-center">
                <span className="text-2xl">-</span>
                <span className="text-4xl">{hitInfo.damage}</span>
                <span className="text-xl">HP</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flash overlay when hit */}
      <AnimatePresence>
        {showHitEffect && hitInfo?.damage > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-red-500 pointer-events-none z-10"
          />
        )}
      </AnimatePresence>

      {/* Attacker Indicator - Updated with animation */}
      <AnimatePresence>
        {showAttackEffect && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute -top-4 left-1/2 transform -translate-x-1/2
                     bg-purple-500 text-white px-2 py-1 rounded-full text-sm z-20
                     flex items-center gap-2"
          >
            <span>Attacking!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Winner Animation - Updated conditions */}
      <AnimatePresence>
        {showWinnerAnimation && !isDefeated && (
          <BattleWinnerAnimation winner={nft} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Update particle styles with more pronounced animation
const particleStyles = `
  @keyframes floatParticle {
    0% {
      transform: translate3d(0, 0, 0);
      opacity: 0.3;
    }
    50% {
      transform: translate3d(5px, -10px, 0);
      opacity: 0.7;
    }
    100% {
      transform: translate3d(0, 0, 0);
      opacity: 0.3;
    }
  }
`;

// Make sure styles are added only once and in a safe way
if (
  typeof document !== "undefined" &&
  !document.getElementById("particle-styles")
) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "particle-styles";
  styleSheet.textContent = particleStyles;
  document.head.appendChild(styleSheet);
}

export default React.memo(BattleCard);
