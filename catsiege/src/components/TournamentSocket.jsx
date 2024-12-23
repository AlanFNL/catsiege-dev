import React, { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const TournamentSocket = ({
  socketRef,
  onBattleUpdate,
  onHitRoll,
  onNftHit,
  onCoinFlip,
  onDiceRoll,
  onFeaturedBattle,
  onTournamentState,
  onTournamentComplete,
  onError,
  requestInitialState,
  children,
}) => {
  useEffect(() => {
    console.log("Setting up socket connection...");
    const socket = io("https://catsiege-dev.onrender.com");
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected successfully");
      if (requestInitialState) {
        console.log("Requesting initial tournament state...");
        socket.emit("requestTournamentState");
      }
    });

    socket.on("tournamentState", (state) => {
      console.log("Raw tournament state received:", state);

      // Validate and format the state before passing it up
      const formattedState = {
        currentRound: state.currentRound || 0,
        totalRounds: state.roundSizes?.length || 10,
        brackets: state.brackets || [],
        currentMatch: state.currentMatch,
        winners: state.winners || [],
        isRunning: state.isRunning || false,
        roundSizes: state.roundSizes,
        stats: {
          currentRound: state.stats?.currentRound || 0,
          totalRounds: state.stats?.totalRounds || 10,
          matchesCompleted: state.stats?.matchesCompleted || 0,
          totalMatchesInRound: state.stats?.totalMatchesInRound || 0,
          playersLeft: state.stats?.playersLeft || 0,
          roundProgress: state.stats?.roundProgress || 0,
        },
        featuredBattle: state.featuredBattle || null,
      };

      console.log("Formatted tournament state:", formattedState);
      onTournamentState?.(formattedState);
    });

    socket.on("featuredBattle", (battle) => {
      console.log("Received featured battle:", battle);
      const formattedBattle = {
        nft1: {
          ...battle.nft1,
          health: battle.health?.nft1 || battle.nft1.health,
        },
        nft2: {
          ...battle.nft2,
          health: battle.health?.nft2 || battle.nft2.health,
        },
        isFeatured: true,
        currentAttacker: battle.currentAttacker,
        roundNumber: battle.roundNumber,
        winner: battle.winner,
      };
      onFeaturedBattle?.(formattedBattle);
    });

    socket.on("battleUpdate", (data) => {
      console.log("Battle update received:", data);
      if (data.isFeatured || data.featuredBattle) {
        const battleData = {
          nft1: {
            ...data.nft1,
            health: data.health?.nft1 || data.nft1.health,
          },
          nft2: {
            ...data.nft2,
            health: data.health?.nft2 || data.nft2.health,
          },
          isFeatured: true,
          currentAttacker: data.currentAttacker,
        };
        onBattleUpdate?.(battleData);
      }
    });

    socket.on("hitRoll", (data) => {
      console.log("Hit roll received in socket:", data);
      if (data) {
        const rollData = {
          attacker: data.attacker || data.roll?.attacker,
          defender: data.defender || data.roll?.defender,
          roll: typeof data.roll === "number" ? data.roll : data.roll?.value,
          required: data.required || data.roll?.required || 4,
          isFeatured: data.featuredBattle,
        };

        if (
          rollData.attacker &&
          rollData.defender &&
          rollData.roll !== undefined
        ) {
          onHitRoll?.(rollData);
        } else {
          console.warn("Received incomplete hit roll data:", data);
        }
      }
    });

    socket.on("nftHit", (data) => {
      console.log("NFT hit received in socket:", data);
      if (data && (data.isFeatured || data.featuredBattle)) {
        const hitData = {
          attacker: {
            ...data.attacker,
            health: data.health?.attacker || data.attacker.health,
          },
          defender: {
            ...(data.target || data.defender),
            health:
              data.health?.defender || (data.target || data.defender).health,
          },
          damage: data.damage,
          isFeatured: true,
        };

        if (hitData.attacker && hitData.defender) {
          onNftHit?.(hitData);
        }
      }
    });

    socket.on("coinFlip", (data) => {
      console.log("Coin flip received in socket:", data);
      if (data) {
        const coinFlipData = {
          result: data.result,
          nft1: data.nft1 || data.players?.[0],
          nft2: data.nft2 || data.players?.[1],
          winner:
            data.winner || data.players?.find((p) => p.id === data.winnerId),
        };

        if (coinFlipData.result && coinFlipData.nft1 && coinFlipData.nft2) {
          onCoinFlip?.(coinFlipData);
        } else {
          console.warn("Received incomplete coin flip data:", data);
        }
      }
    });

    socket.on("diceRoll", (data) => {
      console.log("Dice roll received:", data);
      onDiceRoll?.(data);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
      onError?.(error);
    });

    socket.on("tournamentWinner", (winner) => {
      console.log("Tournament winner received:", winner);
      if (onTournamentState) {
        onTournamentState({ winner });
      }
    });

    socket.on("tournamentComplete", (data) => {
      console.log("Tournament complete received:", data);
      onTournamentComplete?.(data);
    });

    return () => {
      console.log("Cleaning up socket connection");
      if (socketRef.current) {
        socketRef.current.off("tournamentState");
        socketRef.current.off("featuredBattle");
        socketRef.current.off("battleUpdate");
        socketRef.current.off("hitRoll");
        socketRef.current.off("nftHit");
        socketRef.current.off("coinFlip");
        socketRef.current.off("diceRoll");
        socketRef.current.off("disconnect");
        socketRef.current.off("error");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      socket.off("tournamentComplete");
    };
  }, [requestInitialState]);

  return children;
};

export default TournamentSocket;
