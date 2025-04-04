import React from "react";
import { motion } from "framer-motion";
import { STATS } from "./constants";

const StatBar = ({ label, value, max = 100, color = "bg-blue-500" }) => {
  // Calculate percentage, but cap at 100% for display purposes
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className="mb-2">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[#FFF5E4]/80">{label}</span>
        <span className="text-[#FFF5E4] font-medium">{value}</span>
      </div>
      <div className="h-2 bg-[#1d1c19] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
};

const StatValue = ({ label, value, icon }) => {
  return (
    <div className="flex items-center justify-between text-sm p-2 bg-[#1d1c19] rounded-lg">
      <span className="text-[#FFF5E4]/80">{label}</span>
      <div className="flex items-center">
        <span className="text-[#FFF5E4] font-medium mr-1">{value}%</span>
        {icon && <span>{icon}</span>}
      </div>
    </div>
  );
};

const CharacterCard = ({ character, items = [], isPlayer = false }) => {
  if (!character) return null;

  const { name, stats } = character;

  // Determine max values for the stat bars
  const maxHealth = 200; // Assuming max health is 200
  const maxAttack = 50; // Assuming max attack is 50
  const maxDefense = 50; // Assuming max defense is 50
  const maxSpeed = 30; // Assuming max speed is 30

  // Colors for each stat type
  const statColors = {
    [STATS.HEALTH]: "bg-red-500",
    [STATS.ATTACK]: "bg-orange-500",
    [STATS.DEFENSE]: "bg-blue-500",
    [STATS.SPEED]: "bg-green-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#2a2924]/50 backdrop-blur-sm p-6 rounded-xl border border-[#FFF5E4]/10"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#FBE294]">{name}</h2>
        {isPlayer && (
          <span className="px-2 py-1 text-xs font-medium bg-[#FBE294]/20 text-[#FBE294] rounded-full">
            Your Character
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <StatBar
            label="Health"
            value={stats[STATS.HEALTH]}
            max={maxHealth}
            color={statColors[STATS.HEALTH]}
          />
          <StatBar
            label="Attack"
            value={stats[STATS.ATTACK]}
            max={maxAttack}
            color={statColors[STATS.ATTACK]}
          />
          <StatBar
            label="Defense"
            value={stats[STATS.DEFENSE]}
            max={maxDefense}
            color={statColors[STATS.DEFENSE]}
          />
          <StatBar
            label="Speed"
            value={stats[STATS.SPEED]}
            max={maxSpeed}
            color={statColors[STATS.SPEED]}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <StatValue
            label="Critical Hit"
            value={stats[STATS.CRITICAL] || 5}
            icon="⚡"
          />
          <StatValue
            label="Evasion"
            value={stats[STATS.EVASION] || 5}
            icon="💨"
          />
        </div>

        {items && items.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-[#FFF5E4]/70 mb-2">
              Equipped Items ({items.length})
            </h3>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center p-2 bg-[#1d1c19] rounded-lg text-sm"
                >
                  <span className="mr-2 text-lg">{item.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-[#FFF5E4]">
                      {item.name}
                    </div>
                    <div
                      className={`text-xs ${
                        item.rarity?.color || "text-gray-400"
                      }`}
                    >
                      {item.rarity?.name || "Unknown"} {item.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CharacterCard;
