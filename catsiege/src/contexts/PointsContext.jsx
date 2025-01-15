import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { authService } from "../services/api";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNFTVerification } from "../hooks/useNFTVerification";

const PointsContext = createContext(null);

const QUESTS = {
  REGISTER: {
    id: "REGISTER",
    title: "Create an Account",
    description: "Sign up for a new account",
    points: 100,
    type: "one-time",
  },
  DAILY_LOGIN: {
    id: "DAILY_LOGIN",
    title: "Daily Login",
    description: "Log in to your account daily",
    points: 50,
    type: "daily",
  },
  NFT_HOLDER: {
    id: "NFT_HOLDER",
    title: "NFT Holder",
    description: "Hold at least one NFT from our collection",
    points: 750,
    type: "one-time",
  },
};

export function PointsProvider({ children }) {
  const { user } = useAuth();
  const [completedQuests, setCompletedQuests] = useState([]);
  const [questTimers, setQuestTimers] = useState({});

  // Load quests and set up timers
  useEffect(() => {
    if (user) {
      const loadQuests = async () => {
        try {
          const response = await authService.getQuests();
          setCompletedQuests(response.completedQuests || []);

          // Set up timers for daily quests
          const dailyQuests =
            response.completedQuests?.filter(
              (quest) => QUESTS[quest.questId]?.type === "daily"
            ) || [];

          const timers = {};
          dailyQuests.forEach((quest) => {
            if (quest.nextAvailable) {
              timers[quest.questId] = new Date(quest.nextAvailable).getTime();
            }
          });

          setQuestTimers(timers);
        } catch (error) {
          console.error("Failed to load quests:", error);
        }
      };
      loadQuests();
    }
  }, [user]);

  // Update timers every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setQuestTimers((prev) => {
        const updated = { ...prev };
        Object.entries(updated).forEach(([questId, time]) => {
          if (time <= now) {
            delete updated[questId];
          }
        });
        return updated;
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const isQuestCompleted = (questId) => {
    const quest = QUESTS[questId];
    if (!quest) return false;

    // One-time quests
    if (quest.type === "one-time") {
      return completedQuests.some((q) => q.questId === questId);
    }

    // Daily quests are never "completed", only on cooldown
    return false;
  };

  const canClaimQuest = (questId) => {
    console.log("Checking if can claim quest:", {
      questId,
      userQuests: user?.quests,
      walletConnected: user?.walletAddress,
      isCompleted: isQuestCompleted(questId),
    });

    const quest = QUESTS[questId];
    if (!quest) return false;

    if (questId === "NFT_HOLDER") {
      const canClaim =
        user?.quests?.nftVerified === true &&
        user?.walletAddress &&
        !isQuestCompleted(questId);
      console.log("NFT holder quest claimable:", canClaim, {
        nftVerified: user?.quests?.nftVerified,
        walletAddress: user?.walletAddress,
        isCompleted: isQuestCompleted(questId),
      });
      return canClaim;
    }

    // One-time quests
    if (quest.type === "one-time") {
      return !isQuestCompleted(questId);
    }

    // Daily quests
    if (quest.type === "daily") {
      const nextAvailable = questTimers[questId];
      if (!nextAvailable) return true;
      return Date.now() >= nextAvailable;
    }

    return false;
  };

  const claimQuest = async (questId) => {
    if (!canClaimQuest(questId)) return;

    try {
      const response = await authService.claimQuest(questId);

      // Update completed quests and timers
      setCompletedQuests(response.completedQuests);

      // Update timers for daily quests
      const dailyQuest = response.completedQuests.find(
        (q) => q.questId === questId && QUESTS[questId]?.type === "daily"
      );

      if (dailyQuest?.nextAvailable) {
        setQuestTimers((prev) => ({
          ...prev,
          [questId]: new Date(dailyQuest.nextAvailable).getTime(),
        }));
      }

      // Update user points
      setUser((prevUser) => ({
        ...prevUser,
        points: Number(response.totalPoints.toFixed(2)),
      }));

      return response;
    } catch (error) {
      console.error("Failed to claim quest:", error);
      throw error;
    }
  };

  const getQuestTimer = (questId) => {
    return questTimers[questId];
  };

  const value = {
    quests: QUESTS,
    completedQuests,
    isQuestCompleted,
    canClaimQuest,
    claimQuest,
    getQuestTimer,
  };

  return (
    <PointsContext.Provider value={value}>{children}</PointsContext.Provider>
  );
}

export const usePoints = () => {
  const context = useContext(PointsContext);
  if (!context) {
    throw new Error("usePoints must be used within a PointsProvider");
  }
  return context;
};
