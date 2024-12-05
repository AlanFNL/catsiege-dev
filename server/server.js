require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const Tournament = require('./tournamentSchema');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Modified tournament state initialization
let tournamentState = {
  currentRound: 0,
  brackets: [],
  currentMatch: null,
  currentMatches: [],
  completedMatches: new Set(),
  currentFeaturedMatch: null,
  winners: [],
  isRunning: false,
  roundSizes: [],
  lastUpdate: Date.now()
};

// Add this function to calculate round sizes based on actual NFT count
function calculateRoundSizes(nftCount) {
  const roundSizes = [];
  let currentSize = nftCount;
  while (currentSize > 1) {
    roundSizes.push(currentSize);
    currentSize = Math.ceil(currentSize / 2); // Use ceil to handle odd numbers
  }
  roundSizes.push(1); // Final winner
  return roundSizes;
}

// Add this function to calculate upcoming matches
function getUpcomingMatches(tournamentState) {
  const currentBracket = tournamentState.brackets[tournamentState.currentRound];
  const currentMatchIndex = currentBracket.findIndex(
    nft => nft.id === tournamentState.currentMatch?.nft1.id
  );
  
  // If we can't find current match or it's invalid, return empty array
  if (currentMatchIndex === -1 || currentMatchIndex % 2 !== 0) {
    return [];
  }

  const upcomingMatches = [];
  // Look for next 3 matches
  for (let i = currentMatchIndex + 2; i < currentBracket.length - 1; i += 2) {
    // Make sure we have both NFTs for the match
    if (i + 1 < currentBracket.length) {
      upcomingMatches.push({
        nft1: currentBracket[i],
        nft2: currentBracket[i + 1]
      });
    }
    
    // Only get up to 3 upcoming matches
    if (upcomingMatches.length >= 3) break;
  }

  return upcomingMatches;
}

// Modify the calculateTournamentStats function to fix the calculations
function calculateTournamentStats(tournamentState) {
  if (!tournamentState.brackets || !tournamentState.brackets.length) {
    return {
      currentRound: 0,
      totalRounds: tournamentState.roundSizes.length,
      remainingMatches: 0,
      playersLeft: 0,
      roundProgress: 0,
      matchesCompleted: 0,
      totalMatchesInRound: 0,
      upcomingMatches: []
    };
  }

  const currentBracket = tournamentState.brackets[tournamentState.currentRound];
  const currentRoundSize = tournamentState.roundSizes[tournamentState.currentRound];
  const initialMatchesInRound = Math.floor(currentRoundSize / 2);
  
  // Count completed matches for this round
  const completedMatches = tournamentState.currentMatches.reduce((count, match) => {
    const matchKey = `${Math.min(match.nft1.id, match.nft2.id)}-${Math.max(match.nft1.id, match.nft2.id)}`;
    return count + (tournamentState.completedMatches.has(matchKey) ? 1 : 0);
  }, 0);
  
  // Calculate remaining matches in current round
  const remainingMatches = initialMatchesInRound - completedMatches;
  
  // Calculate round progress
  const roundProgress = Math.round((completedMatches / initialMatchesInRound) * 100);

  return {
    currentRound: tournamentState.currentRound + 1,
    totalRounds: tournamentState.roundSizes.length,
    remainingMatches,
    playersLeft: currentBracket.length,
    roundProgress,
    matchesCompleted: completedMatches,
    totalMatchesInRound: initialMatchesInRound,
    upcomingMatches: getUpcomingMatches(tournamentState)
  };
}

// Modify the tournament state emission to include stats
function emitTournamentState() {
  // Calculate stats first
  const stats = calculateTournamentStats(tournamentState);
  
  // Prepare the complete state object
  const completeState = {
    currentRound: tournamentState.currentRound,
    totalRounds: tournamentState.roundSizes.length,
    brackets: tournamentState.brackets,
    currentMatch: tournamentState.currentMatch,
    currentMatches: tournamentState.currentMatches,
    winners: tournamentState.winners,
    isRunning: tournamentState.isRunning,
    stats: {
      currentRound: stats.currentRound,
      totalRounds: stats.totalRounds,
      matchesCompleted: stats.matchesCompleted,
      totalMatchesInRound: stats.totalMatchesInRound,
      playersLeft: stats.playersLeft,
      roundProgress: stats.roundProgress
    },
    featuredBattle: tournamentState.currentFeaturedMatch
  };

  console.log('Emitting tournament state:', completeState);
  io.emit('tournamentState', completeState);
}

// Modified Socket.IO connection handling
io.on('connection', async (socket) => {
  console.log('Client connected');

  try {
    // First check for ongoing tournament
    const ongoingTournament = await Tournament.findOne({ isRunning: true });
    if (ongoingTournament) {
      console.log('Found ongoing tournament:', ongoingTournament._id);
      
      // Restore tournament state including featured battle
      tournamentState = ongoingTournament.toTournamentState();

      // Emit tournament state and featured battle
      socket.emit('tournamentState', tournamentState);
      
      if (ongoingTournament.featuredBattle) {
        socket.emit('featuredBattle', {
          nft1: ongoingTournament.featuredBattle.nft1,
          nft2: ongoingTournament.featuredBattle.nft2,
          isFeatured: true,
          health: {
            nft1: ongoingTournament.featuredBattle.nft1.health,
            nft2: ongoingTournament.featuredBattle.nft2.health
          }
        });
      }
    } else {
      // If no ongoing tournament, check for most recent completed tournament
      const lastCompletedTournament = await Tournament.findOne(
        { completedAt: { $exists: true } },
        {},
        { sort: { completedAt: -1 } }
      );

      if (lastCompletedTournament) {
        console.log('Found completed tournament:', lastCompletedTournament._id);
        socket.emit('tournamentState', {
          ...lastCompletedTournament.toObject(),
          isRunning: false
        });
      }
    }
  } catch (error) {
    console.error('Error checking tournament status:', error);
  }

  socket.on('initializeTournament', async () => {
    try {
      // Check for existing tournament (unchanged)
      const existingTournament = await Tournament.findOne({ isRunning: true });
      if (existingTournament) {
        console.log('Tournament already in progress');
        socket.emit('error', { message: 'A tournament is already in progress' });
        return;
      }

      console.log('Fetching NFTs from Magic Eden...');
      const nfts = await fetchNFTsFromMagicEden();
      console.log(`Fetched ${nfts.length} NFTs`);
      
      if (!nfts || nfts.length < 2) { // Changed minimum requirement to 2 NFTs
        throw new Error('Not enough NFTs fetched. Minimum 2 required.');
      }

      // Calculate round sizes based on actual NFT count
      const roundSizes = calculateRoundSizes(nfts.length);

      // Create new tournament in database
      const newTournament = new Tournament({
        brackets: [nfts.map(nft => ({ ...nft, health: 32, wins: 0, losses: 0 }))],
        currentRound: 0,
        isRunning: true,
        roundSizes: roundSizes,
        lastUpdate: Date.now(),
        startedAt: Date.now()
      });

      console.log('Saving new tournament...');
      await newTournament.save();
      
      tournamentState = {
        ...newTournament.toObject(),
        completedMatches: new Set()
      };
      
      console.log('Tournament created, starting matches...');
      io.emit('tournamentState', tournamentState);
      runTournament();

      // Make sure to emit the initial featured battle
      if (tournamentState.currentMatches && tournamentState.currentMatches.length > 0) {
        const firstMatch = tournamentState.currentMatches[0];
        tournamentState.currentFeaturedMatch = firstMatch;
        emitFeaturedBattle(firstMatch);
      }
      
      emitTournamentState();
    } catch (error) {
      console.error('Tournament initialization error:', error);
      socket.emit('error', { message: 'Failed to initialize tournament' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  // Add handler for changing featured battle
  socket.on('changeFeaturedBattle', (matchIndex) => {
    if (tournamentState.currentMatches && 
        tournamentState.currentMatches[matchIndex]) {
      tournamentState.currentFeaturedMatch = tournamentState.currentMatches[matchIndex];
      emitTournamentState();
    }
  });

  // Add handler for getCurrentTournamentState
  socket.on("getCurrentTournamentState", () => {
    if (tournamentState.isRunning) {
      // Calculate current stats
      const stats = calculateTournamentStats(tournamentState);
      
      // Send complete state to the requesting client
      socket.emit("tournamentState", {
        ...tournamentState,
        stats
      });
    }
  });

  // Add handler for initial state request
  socket.on('requestTournamentState', async () => {
    try {
      const tournament = await Tournament.findById(tournamentState._id);
      if (tournament) {
        const state = tournament.toTournamentState();
        const stats = calculateTournamentStats(state);
        
        socket.emit('tournamentState', {
          ...state,
          stats,
          featuredBattle: tournament.featuredBattle
        });
      }
    } catch (error) {
      console.error('Error fetching tournament state:', error);
    }
  });

  // Add handler for health updates
  socket.on('nftHit', async (data) => {
    if (data.isFeatured && tournamentState._id) {
      try {
        // Update the health in the database
        await Tournament.findByIdAndUpdate(
          tournamentState._id,
          {
            $set: {
              'featuredBattle.battleHealth.nft1': data.health.nft1,
              'featuredBattle.battleHealth.nft2': data.health.nft2
            }
          }
        );
      } catch (error) {
        console.error('Error updating battle health:', error);
      }
    }
  });
});

// Update the simulateBattle function with new hit mechanics
function simulateBattle(nft1, nft2, isFeatured) {
  return new Promise(resolve => {
    const firstAttacker = Math.random() > 0.5 ? nft1 : nft2;
    const secondAttacker = firstAttacker === nft1 ? nft2 : nft1;
    
    console.log('Battle starting:', { 
      isFeatured, 
      firstAttacker: firstAttacker.name,
      nft1Id: nft1.id,
      nft2Id: nft2.id 
    });

    const shouldEmitEvents = isFeatured || (
      tournamentState.currentFeaturedMatch && 
      tournamentState.currentFeaturedMatch.nft1.id === nft1.id && 
      tournamentState.currentFeaturedMatch.nft2.id === nft2.id
    );

    // Initial coin flip
    if (shouldEmitEvents) {
      io.emit('coinFlip', {
        winner: firstAttacker,
        loser: secondAttacker
      });
    }

    // Start battle sequence
    setTimeout(() => {
      // Initial dice roll attack
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      const initialDamage = dice1 + dice2;

      if (shouldEmitEvents) {
        io.emit('diceRoll', {
          attacker: firstAttacker,
          defender: secondAttacker,
          dice1,
          dice2,
          totalDamage: initialDamage
        });
      }

      // Apply initial damage
      setTimeout(() => {
        secondAttacker.health -= initialDamage;

        if (shouldEmitEvents) {
          io.emit('nftHit', {
            attacker: firstAttacker,
            target: secondAttacker,
            damage: initialDamage,
            featuredBattle: shouldEmitEvents
          });

          io.emit('battleUpdate', { 
            nft1: nft1, 
            nft2: nft2,
            featuredBattle: shouldEmitEvents
          });
        }

        // Check if initial attack was lethal
        if (secondAttacker.health <= 0) {
          if (shouldEmitEvents) {
            io.emit('battleResult', { 
              winner: firstAttacker, 
              loser: secondAttacker 
            });
          }
          resolve(firstAttacker);
          return;
        }

        // Start regular battle sequence after 3 seconds
        setTimeout(() => {
          let currentAttacker = secondAttacker; // Switch attacker after initial hit
          let currentDefender = firstAttacker;
          
          const battle = setInterval(() => {
            // Generate hit chance roll (0-100)
            const hitRoll = Math.random() * 100;
            let damage = 0;
            let willHit = true;

            // Damage calculation based on roll ranges
            if (hitRoll < 10) {
              willHit = false;  // Miss (0-9)
              damage = 0;
            } else if (hitRoll < 31) {
              damage = 1;      // Light hit (10-30)
            } else if (hitRoll < 71) {
              damage = 2;      // Medium hit (31-70)
            } else {
              damage = 3;      // Critical hit (71-100)
            }

            if (shouldEmitEvents) {
              io.emit('hitRoll', {
                attacker: currentAttacker,
                defender: currentDefender,
                roll: Math.floor(hitRoll),
                success: willHit,
                damage: damage,
                featuredBattle: shouldEmitEvents
              });
            }

            // Apply damage if hit successful
            if (willHit) {
              currentDefender.health -= damage;
              
              if (shouldEmitEvents) {
                io.emit('nftHit', {
                  attacker: currentAttacker,
                  target: currentDefender,
                  damage: damage,
                  featuredBattle: shouldEmitEvents
                });

                io.emit('battleUpdate', { 
                  nft1: {
                    ...nft1,
                    health: nft1.health
                  }, 
                  nft2: {
                    ...nft2,
                    health: nft2.health
                  },
                  featuredBattle: shouldEmitEvents
                });
              }
            }

            // Check for battle end
            if (currentDefender.health <= 0) {
              clearInterval(battle);
              
              // Mark this match as completed
              const matchKey = `${Math.min(nft1.id, nft2.id)}-${Math.max(nft1.id, nft2.id)}`;
              tournamentState.completedMatches.add(matchKey);
              
              if (shouldEmitEvents) {
                io.emit('battleResult', { 
                  winner: currentAttacker, 
                  loser: currentDefender 
                });
              }

              // Emit updated tournament state with new stats
              emitTournamentState();
              
              resolve(currentAttacker);
              return;
            }

            // Switch attacker and defender
            const temp = currentAttacker;
            currentAttacker = currentDefender;
            currentDefender = temp;
          }, 6000); // Regular hits every 6 seconds

        }, 3000); // Delay before starting regular hits

      }, 2000); // Dice roll damage animation
    }, 4000); // Initial coin flip animation
  });
}

// Update the runTournament function to handle odd numbers
async function runTournament() {
  while (tournamentState.isRunning) {
    const currentBracket = tournamentState.brackets[tournamentState.currentRound];
    
    if (currentBracket.length <= 1) {
      // Tournament end handling (unchanged)
      await Tournament.findByIdAndUpdate(tournamentState._id, {
        isRunning: false,
        winners: currentBracket,
        completedAt: Date.now(),
        featuredBattle: null
      });
      break;
    }

    // Create pairs of matches, handling odd numbers
    const matchPairs = [];
    const byeWinners = [];
    
    for (let i = 0; i < currentBracket.length; i += 2) {
      if (i + 1 < currentBracket.length) {
        // Regular match pair
        matchPairs.push({
          nft1: currentBracket[i],
          nft2: currentBracket[i + 1]
        });
      } else {
        // Odd NFT gets a bye
        byeWinners.push({ ...currentBracket[i], health: 32 });
      }
    }

    // Set and persist featured battle for the round
    tournamentState.currentFeaturedMatch = matchPairs[0];
    tournamentState.currentMatches = matchPairs;
    
    // Update database with new round state and featured battle
    await Tournament.findByIdAndUpdate(tournamentState._id, {
      currentRound: tournamentState.currentRound,
      brackets: tournamentState.brackets,
      currentMatches: matchPairs,
      currentFeaturedMatch: matchPairs[0],
      lastUpdate: Date.now()
    });

    // Emit the featured battle
    await emitFeaturedBattle(tournamentState.currentFeaturedMatch);
    emitTournamentState();

    // Run all battles simultaneously
    const battlePromises = matchPairs.map(pair => 
      simulateBattle(
        pair.nft1, 
        pair.nft2, 
        pair === tournamentState.currentFeaturedMatch // Pass isFeatured flag
      )
    );

    // Wait for all battles to complete
    const winners = await Promise.all(battlePromises);

    // Process winners including bye matches
    const finalWinners = [
      ...winners.map(winner => ({ ...winner, health: 32 })),
      ...byeWinners
    ];

    // Update tournament state for next round
    tournamentState = {
      ...tournamentState,
      currentRound: tournamentState.currentRound + 1,
      brackets: [...tournamentState.brackets, finalWinners],
      currentMatches: [],
      completedMatches: new Set(),
      lastUpdate: Date.now()
    };

    // Save to database
    await Tournament.findByIdAndUpdate(tournamentState._id, {
      currentRound: tournamentState.currentRound,
      brackets: tournamentState.brackets,
      lastUpdate: Date.now()
    });

    emitTournamentState();
    
    // Brief pause before next round
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

// Function to fetch NFTs from Magic Eden
async function fetchNFTsFromMagicEden() {
  try {
    const batchSize = 100; // Magic Eden's limit per request
    const maxBatches = 2;  // Start with fewer batches to reduce load
    let allNFTs = [];

    console.log('Starting NFT fetch from Magic Eden...');

    // Make requests sequentially to avoid overwhelming the API
    for (let i = 0; i < maxBatches; i++) {
      try {
        const response = await axios.get('https://api-mainnet.magiceden.dev/v2/collections/catsiege_zero/listings', {
          params: {
            limit: batchSize,
            offset: i * batchSize
          },
          headers: {
            'Accept': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        });

        const validNFTs = response.data
          .filter(listing => listing.token && listing.token.image)
          .map((listing, index) => ({
            id: allNFTs.length + index,
            name: listing.token.name,
            image: listing.token.image,
            mint: listing.token.mint,
            health: 32,
            wins: 0,
            losses: 0
          }));
        
        allNFTs = [...allNFTs, ...validNFTs];
        console.log(`Batch ${i + 1}: Retrieved ${validNFTs.length} NFTs`);

      } catch (batchError) {
        console.warn(`Warning: Batch ${i + 1} failed:`, batchError.message);
        continue; // Continue with next batch if one fails
      }
    }

    console.log(`Fetched ${allNFTs.length} total NFTs before shuffling`);

    if (allNFTs.length < 2) {
      throw new Error('Not enough NFTs found. Minimum 2 required.');
    }

    // Shuffle all NFTs
    const shuffledNFTs = allNFTs.sort(() => Math.random() - 0.5);

    console.log(`Successfully prepared ${shuffledNFTs.length} NFTs for tournament`);
    return shuffledNFTs;

  } catch (error) {
    console.error('Error in fetchNFTsFromMagicEden:', error);
    throw new Error(`Failed to fetch NFTs: ${error.message}`);
  }
}

// Update the emitFeaturedBattle function
async function emitFeaturedBattle(battle) {
  if (battle && battle.nft1 && battle.nft2) {
    const battleData = {
      nft1: {
        ...battle.nft1,
        health: battle.nft1.health
      },
      nft2: {
        ...battle.nft2,
        health: battle.nft2.health
      },
      isFeatured: true,
      currentAttacker: battle.currentAttacker
    };
    
    if (tournamentState._id) {
      try {
        await Tournament.findByIdAndUpdate(
          tournamentState._id,
          {
            $set: {
              featuredBattle: {
                nft1: battle.nft1,
                nft2: battle.nft2,
                currentAttacker: battle.currentAttacker || 'nft1',
                battleHealth: {
                  nft1: battle.nft1.health,
                  nft2: battle.nft2.health
                },
                lastUpdate: new Date()
              }
            }
          },
          { new: true }
        );
      } catch (error) {
        console.error('Error updating featured battle:', error);
      }
    }
    
    io.emit('featuredBattle', battleData);
  }
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});