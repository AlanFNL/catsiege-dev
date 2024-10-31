require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

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

// Store tournament state
let tournamentState = {
  currentRound: 0,
  brackets: [],
  currentMatch: null,
  winners: [],
  isRunning: false,
  roundSizes: [512, 256, 128, 64, 32, 16, 8, 4, 2, 1],
  lastUpdate: Date.now()
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected');

  // Send current tournament state to new connections
  socket.emit('tournamentState', tournamentState);

  // Handle tournament initialization
  socket.on('initializeTournament', async (data) => {
    try {
      const nfts = await fetchNFTsFromMagicEden(); // Implement this function
      tournamentState = {
        ...tournamentState,
        brackets: [nfts.map(nft => ({ ...nft, health: 2, wins: 0, losses: 0 }))],
        currentRound: 0,
        isRunning: true,
        lastUpdate: Date.now()
      };
      
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

// Function to run the tournament
async function runTournament() {
  while (tournamentState.isRunning) {
    const currentBracket = tournamentState.brackets[tournamentState.currentRound];
    
    if (currentBracket.length <= 1) {
      tournamentState.isRunning = false;
      tournamentState.winners = currentBracket;
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

        // Simulate battle with delay
        await new Promise(resolve => setTimeout(resolve, 2000));
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

    io.emit('tournamentState', tournamentState);
    await new Promise(resolve => setTimeout(resolve, 3000)); // Delay between rounds
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

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});