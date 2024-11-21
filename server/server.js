require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');

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

// Tournament Schema
const tournamentSchema = new mongoose.Schema({
  currentRound: Number,
  brackets: Array,
  currentMatch: Object,
  currentMatches: Array,
  currentFeaturedMatch: Object,
  winners: Array,
  isRunning: Boolean,
  roundSizes: Array,
  lastUpdate: Date,
  startedAt: Date,
  completedAt: Date
});

const Tournament = mongoose.model('Tournament', tournamentSchema);

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
  roundSizes: [512, 256, 128, 64, 32, 16, 8, 4, 2, 1],
  lastUpdate: Date.now()
};

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
  const stats = calculateTournamentStats(tournamentState);
  io.emit('tournamentState', {
    ...tournamentState,
    stats,
    currentFeaturedMatch: tournamentState.currentFeaturedMatch
  });
}

// Modified Socket.IO connection handling
io.on('connection', async (socket) => {
  console.log('Client connected');

  try {
    // First check for ongoing tournament
    const ongoingTournament = await Tournament.findOne({ isRunning: true });
    if (ongoingTournament) {
      console.log('Found ongoing tournament:', ongoingTournament._id);
      tournamentState = {
        ...ongoingTournament.toObject(),
        completedMatches: new Set()
      };
      const stats = calculateTournamentStats(tournamentState);
      socket.emit('tournamentState', { ...tournamentState, stats });
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

  socket.on('initializeTournament', async (data) => {
    console.log('Initializing new tournament...');
    try {
      // Check if there's already a running tournament
      const existingTournament = await Tournament.findOne({ isRunning: true });
      if (existingTournament) {
        console.log('Tournament already in progress');
        socket.emit('error', { message: 'A tournament is already in progress' });
        return;
      }

      console.log('Fetching NFTs from Magic Eden...');
      const nfts = await fetchNFTsFromMagicEden();
      console.log(`Fetched ${nfts.length} NFTs`);
      
      if (!nfts || nfts.length < 512) {
        throw new Error('Not enough NFTs fetched');
      }

      // Create new tournament in database
      const newTournament = new Tournament({
        brackets: [nfts.map(nft => ({ ...nft, health: 32, wins: 0, losses: 0 }))],
        currentRound: 0,
        isRunning: true,
        roundSizes: [512, 256, 128, 64, 32, 16, 8, 4, 2, 1],
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
    } catch (error) {
      console.error('Tournament initialization error:', error);
      socket.emit('error', { 
        message: 'Failed to initialize tournament: ' + error.message 
      });
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
});

// Add this function to select a featured battle
function selectFeaturedBattle(matchPairs) {
  if (!matchPairs || matchPairs.length === 0) return null;
  // Randomly select a battle to feature
  const randomIndex = Math.floor(Math.random() * matchPairs.length);
  return matchPairs[randomIndex];
}

// Update the runTournament function to properly handle featured battles
async function runTournament() {
  while (tournamentState.isRunning) {
    const currentBracket = tournamentState.brackets[tournamentState.currentRound];
    if (currentBracket.length <= 1) {
      tournamentState.winners = currentBracket;
      tournamentState.isRunning = false;
      emitTournamentState();
      break;
    }

    // Create match pairs
    const matchPairs = [];
    for (let i = 0; i < currentBracket.length - 1; i += 2) {
      matchPairs.push({
        nft1: currentBracket[i],
        nft2: currentBracket[i + 1]
      });
    }

    // Select and set featured battle
    tournamentState.currentFeaturedMatch = selectFeaturedBattle(matchPairs);
    tournamentState.currentMatches = matchPairs;
    
    // Emit initial state with featured battle
    emitTournamentState();

    // Run battles
    const battlePromises = matchPairs.map(pair => {
      const isFeatured = pair === tournamentState.currentFeaturedMatch;
      return simulateBattle(pair.nft1, pair.nft2, isFeatured);
    });

    const winners = await Promise.all(battlePromises);
    // ... rest of the tournament logic ...
  }
}

// Update the simulateBattle function to properly handle featured battles
async function simulateBattle(nft1, nft2, isFeatured = false) {
  // Determine who strikes first
  const coinFlip = Math.random() < 0.5;
  const firstAttacker = coinFlip ? nft1 : nft2;
  const secondAttacker = coinFlip ? nft2 : nft1;

  if (isFeatured) {
    // Emit coin flip result for featured battle
    io.emit('coinFlip', {
      nft1,
      nft2,
      winner: firstAttacker
    });
    
    // Add delay for animation
    await delay(2000);
  }

  let currentAttacker = firstAttacker;
  let currentDefender = secondAttacker;
  
  while (nft1.health > 0 && nft2.health > 0) {
    // Calculate hit chance and damage
    const hitRoll = Math.random();
    const hitChance = 0.7; // 70% chance to hit
    const damage = Math.floor(Math.random() * 10) + 1; // 1-10 damage

    if (hitRoll < hitChance) {
      // Hit successful
      if (currentDefender === nft1) {
        nft1.health -= damage;
      } else {
        nft2.health -= damage;
      }

      if (isFeatured) {
        io.emit('nftHit', {
          attacker: currentAttacker,
          defender: currentDefender,
          damage,
          remainingHealth: currentDefender === nft1 ? nft1.health : nft2.health
        });
        
        // Add delay for animation
        await delay(1500);
      }
    } else if (isFeatured) {
      // Emit miss event for featured battle
      io.emit('nftMiss', {
        attacker: currentAttacker,
        defender: currentDefender
      });
      
      // Add delay for animation
      await delay(1000);
    }

    // Swap attacker and defender
    [currentAttacker, currentDefender] = [currentDefender, currentAttacker];
  }

  // Determine winner
  const winner = nft1.health > 0 ? nft1 : nft2;
  const loser = nft1.health > 0 ? nft2 : nft1;
  
  // Update stats
  winner.wins++;
  loser.losses++;

  // Mark match as completed
  const matchKey = `${Math.min(nft1.id, nft2.id)}-${Math.max(nft1.id, nft2.id)}`;
  tournamentState.completedMatches.add(matchKey);

  // Emit state update
  emitTournamentState();

  return winner;
}

// Function to fetch NFTs from Magic Eden
async function fetchNFTsFromMagicEden() {
  try {
    const batchSize = 100; // Magic Eden's limit per request
    const requiredNFTs = 512;
    const batches = Math.ceil(requiredNFTs / batchSize);
    let allNFTs = [];

    console.log(`Fetching ${batches} batches of NFTs...`);

    // Make multiple requests in parallel
    const requests = Array.from({ length: batches }, (_, i) => 
      axios.get('https://api-mainnet.magiceden.dev/v2/collections/froganas/listings', {
        params: {
          limit: batchSize,
          offset: i * batchSize
        },
        headers: {
          'Accept': 'application/json'
        }
      })
    );

    const responses = await Promise.all(requests);
    
    // Combine all NFTs from responses
    responses.forEach(response => {
      const validNFTs = response.data
        .filter(listing => listing.token && listing.token.image)
        .map((listing, index) => ({
          id: allNFTs.length + index, // Ensure unique IDs
          name: listing.token.name,
          image: listing.token.image,
          mint: listing.token.mint,
          health: 2,
          wins: 0,
          losses: 0
        }));
      
      allNFTs = [...allNFTs, ...validNFTs];
    });

    console.log(`Fetched ${allNFTs.length} total NFTs before shuffling`);

    if (allNFTs.length < requiredNFTs) {
      throw new Error(`Only found ${allNFTs.length} valid NFTs, need ${requiredNFTs}`);
    }

    // Shuffle and select required number of NFTs
    const shuffledNFTs = allNFTs
      .sort(() => Math.random() - 0.5)
      .slice(0, requiredNFTs);

    console.log(`Successfully prepared ${shuffledNFTs.length} NFTs for tournament`);
    return shuffledNFTs;

  } catch (error) {
    console.error('Error fetching NFTs:', error);
    throw new Error(`Failed to fetch NFTs: ${error.message}`);
  }
}

// Add rate limiting to avoid API issues
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Optional: Add retry logic for failed requests
async function fetchWithRetry(url, config, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, config);
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(1000 * (i + 1)); // Exponential backoff
    }
  }
}

async function fetchNFTsUsingHelius() {
  try {
    const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
    const endpoint = `https://api.helius.xyz/v0/token-metadata?api-key=${HELIUS_API_KEY}`;

    // Froganas collection address
    const collectionAddress = 'YOUR_COLLECTION_ADDRESS';

    const response = await axios.post(endpoint, {
      query: {
        collection: collectionAddress
      },
      options: {
        limit: 10000 // Adjust based on collection size
      }
    });

    const nfts = response.data.result
      .filter(nft => nft.onChainMetadata.metadata.data.uri)
      .map((nft, index) => ({
        id: index,
        name: nft.onChainMetadata.metadata.data.name,
        image: nft.onChainMetadata.metadata.data.uri,
        mint: nft.mint,
        health: 2,
        wins: 0,
        losses: 0
      }));

    return nfts;
  } catch (error) {
    console.error('Error fetching NFTs using Helius:', error);
    throw error;
  }
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});