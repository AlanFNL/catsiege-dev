import React, { useState } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Check, Lock, X, Clock } from "lucide-react";
import { usePoints } from "../contexts/PointsContext";
import { useAuth } from "../contexts/AuthContext";
import points from "../assets/points.png";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNFTVerification } from "../hooks/useNFTVerification";

const questVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1 },
  }),
};

export default function Rewards({ isOpen, onClose }) {
  const { user } = useAuth();
  const {
    quests,
    claimQuest,
    isQuestCompleted,
    canClaimQuest,
    completedQuests,
  } = usePoints();
  const { connected } = useWallet();
  const { hasNFT } = useNFTVerification();
  const [claimingQuest, setClaimingQuest] = useState(null);

  const getQuestStatus = (quest) => {
    // Special handling for NFT holder quest
    if (quest.id === "NFT_HOLDER") {
      if (!connected) {
        return "connect_wallet";
      }
      if (isQuestCompleted(quest.id)) {
        return "completed";
      }
      if (user?.quests?.nftVerified) {
        return "claimable";
      }
      return "locked";
    }

    // Regular quest handling
    if (quest.type !== "daily") {
      return isQuestCompleted(quest.id)
        ? "completed"
        : canClaimQuest(quest.id)
        ? "claimable"
        : "locked";
    }

    // Daily quest handling
    const questData = completedQuests.find((q) => q.questId === quest.id);
    if (!questData) return "claimable";
    if (canClaimQuest(quest.id)) return "claimable";

    const nextAvailable = new Date(questData.nextAvailable);
    const now = new Date();
    const hoursRemaining = Math.max(
      0,
      Math.ceil((nextAvailable - now) / (1000 * 60 * 60))
    );
    const minutesRemaining = Math.max(
      0,
      Math.ceil((nextAvailable - now) / (1000 * 60))
    );

    return {
      status: "cooldown",
      timeRemaining:
        hoursRemaining >= 1
          ? `${hoursRemaining}h remaining`
          : `${minutesRemaining}m remaining`,
    };
  };

  const handleClaim = async (questId) => {
    if (claimingQuest) return; // Prevent multiple claims

    try {
      setClaimingQuest(questId);
      await claimQuest(questId);
    } catch (error) {
      console.error("Failed to claim quest:", error);
    } finally {
      setClaimingQuest(null);
    }
  };

  const renderQuestButton = (quest) => {
    const status = getQuestStatus(quest);
    const isLoading = claimingQuest === quest.id;

    // Special handling for NFT holder quest
    if (quest.id === "NFT_HOLDER") {
      if (status === "connect_wallet") {
        return (
          <button
            onClick={onClose} // Close rewards to show wallet modal
            className="w-full bg-[#FFF5E4] text-black py-2 rounded-lg hover:bg-[#FFF5E4]/90 transition-colors"
          >
            Connect Wallet
          </button>
        );
      }

      if (status === "completed") {
        return (
          <button
            className="w-full bg-green-500/20 text-green-500 py-2 rounded-lg flex items-center justify-center gap-2"
            disabled
          >
            <Check size={20} />
            Completed
          </button>
        );
      }

      if (status === "claimable") {
        return (
          <button
            onClick={() => handleClaim(quest.id)}
            disabled={isLoading}
            className={`w-full bg-[#FFF5E4] text-black py-2 rounded-lg hover:bg-[#FFF5E4]/90 transition-colors flex items-center justify-center gap-2 ${
              isLoading ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Claiming...
              </>
            ) : (
              "Claim Reward"
            )}
          </button>
        );
      }

      return (
        <button
          className="w-full bg-gray-500/20 text-gray-400 py-2 rounded-lg flex items-center justify-center gap-2"
          disabled
        >
          <Lock size={20} />
          Verify NFT Ownership
        </button>
      );
    }

    // Regular quest button rendering
    if (typeof status === "object" && status.status === "cooldown") {
      return (
        <button
          className="w-full bg-gray-500/20 text-gray-400 py-2 rounded-lg flex items-center justify-center gap-2"
          disabled
        >
          <Clock size={20} />
          {status.timeRemaining}
        </button>
      );
    }

    switch (status) {
      case "completed":
        return (
          <button
            className="w-full bg-green-500/20 text-green-500 py-2 rounded-lg flex items-center justify-center gap-2"
            disabled
          >
            <Check size={20} />
            Completed
          </button>
        );
      case "claimable":
        return (
          <button
            onClick={() => handleClaim(quest.id)}
            disabled={isLoading}
            className={`w-full bg-[#FFF5E4] text-black py-2 rounded-lg hover:bg-[#FFF5E4]/90 transition-colors flex items-center justify-center gap-2 ${
              isLoading ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Claiming...
              </>
            ) : (
              "Claim Reward"
            )}
          </button>
        );
      default:
        return (
          <button
            className="w-full bg-gray-500/20 text-gray-400 py-2 rounded-lg flex items-center justify-center gap-2"
            disabled
          >
            <Lock size={20} />
            Locked
          </button>
        );
    }
  };

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 z-[999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[1000] overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="min-h-screen px-4 text-center">
              <span
                className="inline-block h-screen align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>

              <motion.div
                className="inline-block w-full max-w-2xl my-8 text-left align-middle transition-all transform bg-black shadow-xl rounded-2xl border border-[#FFF5E4]/20"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative p-6">
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-[#FFF5E4]/60 hover:text-[#FFF5E4]"
                  >
                    <X size={24} />
                  </button>

                  <div className="flex items-center gap-4 mb-8">
                    <Gift size={32} />
                    <div>
                      <h1 className="text-3xl font-bold text-[#FFF5E4]">
                        Points & Rewards
                      </h1>
                      <p className="text-[#FFF5E4]/60">
                        Complete quests to earn points
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#FFF5E4]/5 rounded-lg p-4 mb-8">
                    <h2 className="text-xl font-bold mb-2 text-[#FFF5E4]">
                      Your Points
                    </h2>
                    <div className="flex gap-4">
                      <img src={points} className="w-8 h-8" />
                      <p className="text-3xl font-bold text-[#FFF5E4]">
                        {user?.points || 0}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {Object.values(quests).map((quest, index) => (
                      <motion.div
                        key={quest.id}
                        className="bg-[#FFF5E4]/5 rounded-lg p-6"
                        variants={questVariants}
                        initial="hidden"
                        animate="visible"
                        custom={index}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-[#FFF5E4] mb-2">
                              {quest.title}
                            </h3>
                            <p className="text-[#FFF5E4]/60">
                              {quest.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex gap-4">
                              <img src={points} className="w-8 h-8" />
                              <p className="text-xl font-bold text-[#FFF5E4]">
                                {quest.points}
                              </p>
                            </div>
                          </div>
                        </div>

                        {renderQuestButton(quest)}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
