import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import RarityEffect from "./RarityEffect";

const ItemCard = ({
  item,
  onSelect,
  isSelected = false,
  isRevealed = false,
  canBeSelected = true,
  isShowcaseMode = false,
}) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [showRarityEffect, setShowRarityEffect] = useState(false);
  const [wasRevealed, setWasRevealed] = useState(false);
  const [isProcessingClick, setIsProcessingClick] = useState(false);

  // Track if card was initially hidden but now revealed (for auto-reveal animation)
  useEffect(() => {
    if (isRevealed && !wasRevealed) {
      setWasRevealed(true);

      // Only auto-flip with animation if not manually revealed already
      if (!isSelected && !isFlipping) {
        setIsFlipping(true);
        setTimeout(() => setIsFlipping(false), 700);
      }
    }
  }, [isRevealed, wasRevealed, isSelected, isFlipping]);

  // Show rarity effect when a card is revealed
  useEffect(() => {
    if (isRevealed && !isFlipping) {
      setShowRarityEffect(true);

      // Hide the effect after it plays
      const timer = setTimeout(() => {
        setShowRarityEffect(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isRevealed, isFlipping]);

  // Card flip animations - different for each rarity
  const getFlipAnimation = () => {
    const baseFlip = {
      initial: { rotateY: 0 },
      flip: {
        rotateY: 180,
        transition: { duration: 0.7, ease: "easeOut" },
      },
    };

    // Enhanced animations based on rarity
    switch (item.rarity.name.toLowerCase()) {
      case "common":
        return baseFlip;
      case "uncommon":
        return {
          initial: { rotateY: 0 },
          flip: {
            rotateY: 180,
            transition: {
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1], // Custom spring animation
            },
          },
        };
      case "rare":
        return {
          initial: { rotateY: 0 },
          flip: {
            rotateY: 180,
            transition: {
              duration: 0.9,
              ease: [0.34, 1.56, 0.64, 1], // Bouncy effect
            },
          },
        };
      case "epic":
        return {
          initial: { rotateY: 0 },
          flip: {
            rotateY: 180,
            transition: {
              duration: 1.0,
              ease: [0.22, 1.84, 0.88, 0.97], // Very bouncy effect
            },
          },
        };
      case "legendary":
        return {
          initial: { rotateY: 0 },
          flip: {
            rotateY: 180,
            transition: {
              duration: 1.2,
              ease: [0.22, 1.84, 0.88, 0.97], // Very bouncy effect
            },
          },
        };
      default:
        return baseFlip;
    }
  };

  // Background effects based on rarity
  const getRarityEffects = () => {
    switch (item.rarity.name.toLowerCase()) {
      case "uncommon":
        return "bg-gradient-to-br from-emerald-900/20 to-emerald-700/5";
      case "rare":
        return "bg-gradient-to-br from-blue-900/30 to-blue-700/10";
      case "epic":
        return "bg-gradient-to-br from-purple-900/30 to-purple-700/10";
      case "legendary":
        return "bg-gradient-to-br from-amber-900/40 to-amber-600/20";
      default:
        return "bg-gradient-to-br from-gray-900/20 to-gray-800/5";
    }
  };

  // Border effects based on rarity
  const getRarityBorder = () => {
    switch (item.rarity.name.toLowerCase()) {
      case "uncommon":
        return "border-emerald-600/40";
      case "rare":
        return "border-blue-600/40";
      case "epic":
        return "border-purple-600/40";
      case "legendary":
        return "border-amber-500/60";
      default:
        return "border-gray-600/40";
    }
  };

  // Glow effects for higher rarities
  const getGlowEffect = () => {
    if (!isRevealed) return "";

    switch (item.rarity.name.toLowerCase()) {
      case "epic":
        return "shadow-[0_0_15px_3px_rgba(147,51,234,0.3)]";
      case "legendary":
        return "shadow-[0_0_20px_5px_rgba(245,158,11,0.4)]";
      case "rare":
        return "shadow-[0_0_10px_2px_rgba(37,99,235,0.25)]";
      default:
        return "";
    }
  };

  // Handle card flip
  const handleCardClick = () => {
    if (!canBeSelected || isRevealed || isProcessingClick || isShowcaseMode)
      return;

    // Set processing flag to prevent multiple rapid clicks
    setIsProcessingClick(true);

    // Select the item IMMEDIATELY, before the animation
    if (onSelect) {
      onSelect();
    }

    setIsFlipping(true);

    // Wait for flip animation to complete
    setTimeout(() => {
      setIsFlipping(false);
      setIsProcessingClick(false); // Reset processing flag
    }, 700);
  };

  const flipAnimation = getFlipAnimation();
  const rarityEffects = getRarityEffects();
  const rarityBorder = getRarityBorder();
  const glowEffect = getGlowEffect();

  return (
    <motion.div
      className={`relative w-full h-80 perspective-1000 cursor-pointer ${
        !canBeSelected && !isRevealed ? "opacity-50" : ""
      } ${isRevealed || isShowcaseMode ? "pointer-events-none" : ""} group`}
      initial="initial"
      animate={isFlipping || isRevealed ? "flip" : "initial"}
      variants={flipAnimation}
      onClick={handleCardClick}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Tooltip for revealed cards */}
      {isRevealed && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-[#1d1c19] border border-[#FFF5E4]/20 px-3 py-1 rounded text-xs text-[#FFF5E4]/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
          {isSelected
            ? "This item is in your loadout"
            : "This item was not selected"}
        </div>
      )}

      {/* Show rarity effect when card is revealed */}
      <RarityEffect
        rarity={item.rarity}
        isVisible={showRarityEffect && isRevealed}
      />

      {/* Front of card (Mystery) */}
      <motion.div
        className={`absolute w-full h-full backface-hidden rounded-lg border-2 border-[#FFF5E4]/20 
                   bg-[#1d1c19] flex flex-col items-center justify-center transition-all duration-300
                   ${isSelected ? "ring-2 ring-[#FBE294]" : ""} overflow-hidden
                   hover:border-[#FBE294]/50 hover:shadow-[0_0_10px_1px_rgba(251,226,148,0.15)] 
                   group-hover:scale-[1.02] group-active:scale-[0.98]`}
        style={{ rotateY: 0, transformStyle: "preserve-3d" }}
      >
        <div className="w-24 h-24 rounded-full bg-[#2a2924] flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
          <span className="text-5xl">?</span>
        </div>
        <h3 className="text-xl text-[#FBE294] mb-2">Mystery Item</h3>
        <p className="text-[#FFF5E4]/70 text-center max-w-[80%]">
          Click to reveal this item!
        </p>

        {/* Decorative elements */}
        <div className="absolute top-2 right-2 text-[#FFF5E4]/30 text-xl">
          ✧
        </div>
        <div className="absolute bottom-2 left-2 text-[#FFF5E4]/30 text-xl">
          ✧
        </div>

        {/* Selection indicator for revealed cards */}
        {isRevealed && isSelected && (
          <div className="absolute top-0 right-0 w-10 h-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-10 h-10 bg-[#FBE294] flex items-center justify-center rounded-bl-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        )}
      </motion.div>

      {/* Back of card (Revealed Item) - Only show rarity styles once revealed */}
      <motion.div
        className={`absolute w-full h-full backface-hidden rounded-lg border-2 ${rarityBorder}
                  ${
                    isRevealed ? rarityEffects : "bg-[#1d1c19]"
                  } p-5 flex flex-col transition-all duration-300
                  ${isRevealed ? glowEffect : ""} ${
          isRevealed && !isSelected ? "opacity-70" : ""
        }`}
        style={{ rotateY: 180, transformStyle: "preserve-3d" }}
      >
        {/* Item Icon */}
        <div className="mb-3 flex justify-between items-center">
          <div className="w-16 h-16 rounded-full bg-[#1d1c19]/80 flex items-center justify-center">
            <span className="text-4xl">{item.icon}</span>
          </div>

          {/* Rarity Tag */}
          <div
            className={`px-3 py-1 rounded-full ${item.rarity.bgColor} text-xs font-semibold`}
          >
            {item.rarity.name}
          </div>
        </div>

        {/* Item Name */}
        <h3 className={`text-xl font-bold mb-1 ${item.rarity.color}`}>
          {item.name}
        </h3>

        {/* Item Type */}
        <p className="text-[#FFF5E4]/70 text-sm mb-2">
          {item.type} • {item.rarity.name}
        </p>

        {/* Item Description */}
        <p className="text-[#FFF5E4]/80 text-sm mb-4 flex-grow line-clamp-3">
          {item.description}
        </p>

        {/* Divider */}
        <div className="w-full h-px bg-[#FFF5E4]/10 my-2"></div>

        {/* Item Stats */}
        <div className="flex flex-wrap gap-2 mt-auto">
          {Object.entries(item.stats)
            .filter(([, value]) => value !== 0) // Only show non-zero stats
            .map(([statKey, value]) => (
              <div
                key={statKey}
                className="flex items-center px-2 py-1 bg-[#1d1c19]/50 rounded"
              >
                <span className="text-[#FFF5E4]/70 mr-1 text-xs">
                  {statKey.charAt(0).toUpperCase() + statKey.slice(1)}:
                </span>
                <span
                  className={`text-xs ${
                    value > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {value > 0 ? `+${value}` : value}
                </span>
              </div>
            ))}
        </div>

        {/* Selection indicator for revealed cards */}
        {isRevealed && isSelected && (
          <div className="absolute top-0 right-0 w-10 h-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-10 h-10 bg-[#FBE294] flex items-center justify-center rounded-bl-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ItemCard;
