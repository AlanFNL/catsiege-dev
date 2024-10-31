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
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
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
  winners: [],
  isRunning: false,
  roundSizes: [512, 256, 128, 64, 32, 16, 8, 4, 2, 1],
  lastUpdate: Date.now()
};

// Modified Socket.IO connection handling
io.on('connection', async (socket) => {
  console.log('Client connected');

  // Check for ongoing tournament
  const ongoingTournament = await Tournament.findOne({ isRunning: true });
  if (ongoingTournament) {
    tournamentState = ongoingTournament.toObject();
  }

  socket.emit('tournamentState', tournamentState);

  socket.on('initializeTournament', async (data) => {
    try {
      const nfts = await fetchNFTsFromMagicEden();
      
      // Create new tournament in database
      const newTournament = new Tournament({
        brackets: [nfts.map(nft => ({ ...nft, health: 2, wins: 0, losses: 0 }))],
        currentRound: 0,
        isRunning: true,
        roundSizes: [512, 256, 128, 64, 32, 16, 8, 4, 2, 1],
        lastUpdate: Date.now(),
        startedAt: Date.now()
      });

      await newTournament.save();
      tournamentState = newTournament.toObject();
      
      io.emit('tournamentState', tournamentState);
      runTournament();
    } catch (error) {
      socket.emit('error', { message: 'Failed to initialize tournament' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Modified runTournament function
async function runTournament() {
  while (tournamentState.isRunning) {
    const currentBracket = tournamentState.brackets[tournamentState.currentRound];
    
    if (currentBracket.length <= 1) {
      tournamentState.isRunning = false;
      tournamentState.winners = currentBracket;
      tournamentState.completedAt = Date.now();
      
      await Tournament.findByIdAndUpdate(tournamentState._id, {
        isRunning: false,
        winners: currentBracket,
        completedAt: Date.now()
      });

      io.emit('tournamentState', tournamentState);
      break;
    }

    const winners = [];
    for (let i = 0; i < currentBracket.length; i += 2) {
      if (i + 1 < currentBracket.length) {
        // Update current match
        tournamentState.currentMatch = {
          nft1: currentBracket[i],
          nft2: currentBracket[i + 1]
        };
        io.emit('tournamentState', tournamentState);

        // Wait 2 seconds before battle
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate battle and get winner
        const winner = await simulateBattle(currentBracket[i], currentBracket[i + 1]);
        winners.push({ ...winner, health: 2 });
      } else {
        winners.push({ ...currentBracket[i], health: 2 });
      }
    }

    tournamentState = {
      ...tournamentState,
      currentRound: tournamentState.currentRound + 1,
      brackets: [...tournamentState.brackets, winners],
      lastUpdate: Date.now()
    };

    // Update tournament in database
    await Tournament.findByIdAndUpdate(tournamentState._id, {
      currentRound: tournamentState.currentRound,
      brackets: tournamentState.brackets,
      lastUpdate: Date.now()
    });

    io.emit('tournamentState', tournamentState);
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

// Battle simulation function
function simulateBattle(nft1, nft2) {
  return new Promise(resolve => {
    const battle = setInterval(() => {
      const damage = Math.random() > 0.5 ? 1 : 0;
      const target = Math.random() > 0.5 ? nft1 : nft2;
      target.health -= damage;

      if (target.health <= 0) {
        clearInterval(battle);
        resolve(target === nft1 ? nft2 : nft1);
      }

      io.emit('battleUpdate', { nft1, nft2 });
    }, 1000);
  });
}

// Function to fetch NFTs from Magic Eden
async function fetchNFTsFromMagicEden() {
  try {
    // Magic Eden API endpoint for Mad Lads collection
    const response = await axios.get('https://api-mainnet.magiceden.dev/v2/collections/mad_lads/listings', {
      params: {
        limit: 1000, // Fetch more than we need to ensure we get enough valid listings
        offset: 0
      },
      headers: {
        'Accept': 'application/json'
      }
    });

    // Shuffle and select 512 NFTs
    const shuffledNFTs = response.data
      .filter(listing => listing.token && listing.token.image) // Ensure we have valid image URLs
      .sort(() => Math.random() - 0.5) // Shuffle the array
      .slice(0, 512) // Take only 512 NFTs
      .map((listing, index) => ({
        id: index,
        name: listing.token.name,
        image: listing.token.image,
        mint: listing.token.mint,
        health: 2,
        wins: 0,
        losses: 0
      }));

    return shuffledNFTs;
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    throw error;
  }
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});