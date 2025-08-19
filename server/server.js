const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Game state
const lobbies = new Map();
const games = new Map();

// Helper functions
function generateLobbyCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function createLobby(hostId, hostName) {
  const lobbyCode = generateLobbyCode();
  const lobby = {
    id: lobbyCode,
    hostId: hostId,
    players: [{ id: hostId, name: hostName, isHost: true, score: 0 }],
    status: 'waiting', // waiting, playing, finished
    maxPlayers: 8,
    currentRound: 0,
    totalRounds: 5,
    images: [],
    currentImage: null,
    captions: [],
    votes: [],
    roundTimer: null,
    phase: 'waiting' // waiting, caption, voting, results
  };
  
  lobbies.set(lobbyCode, lobby);
  return lobby;
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join lobby
  socket.on('joinLobby', ({ lobbyCode, playerName }) => {
    const lobby = lobbies.get(lobbyCode);
    
    if (!lobby) {
      socket.emit('error', { message: 'Lobby not found' });
      return;
    }
    
    if (lobby.players.length >= lobby.maxPlayers) {
      socket.emit('error', { message: 'Lobby is full' });
      return;
    }
    
    if (lobby.status === 'playing') {
      socket.emit('error', { message: 'Game already in progress' });
      return;
    }
    
    // Check if player already exists
    const existingPlayer = lobby.players.find(p => p.name === playerName);
    if (existingPlayer) {
      socket.emit('error', { message: 'Player name already taken' });
      return;
    }
    
    const player = { id: socket.id, name: playerName, isHost: false, score: 0 };
    lobby.players.push(player);
    
    socket.join(lobbyCode);
    socket.lobbyCode = lobbyCode;
    socket.playerId = socket.id;
    
    io.to(lobbyCode).emit('lobbyUpdate', lobby);
    socket.emit('joinedLobby', { lobby, playerId: socket.id });
  });

  // Create lobby
  socket.on('createLobby', ({ playerName }) => {
    const lobby = createLobby(socket.id, playerName);
    socket.join(lobby.id);
    socket.lobbyCode = lobby.id;
    socket.playerId = socket.id;
    
    socket.emit('lobbyCreated', { lobby, playerId: socket.id });
  });

  // Start game
  socket.on('startGame', () => {
    const lobby = lobbies.get(socket.lobbyCode);
    
    if (!lobby || lobby.hostId !== socket.id) {
      socket.emit('error', { message: 'Only host can start the game' });
      return;
    }
    
    if (lobby.players.length < 3) {
      socket.emit('error', { message: 'Need at least 3 players to start' });
      return;
    }
    
    lobby.status = 'playing';
    lobby.currentRound = 1;
    lobby.phase = 'caption';
    
    // Start first round
    startRound(lobby);
    
    io.to(socket.lobbyCode).emit('gameStarted', lobby);
  });

  // Submit caption
  socket.on('submitCaption', ({ caption }) => {
    const lobby = lobbies.get(socket.lobbyCode);
    
    if (!lobby || lobby.phase !== 'caption') {
      return;
    }
    
    const player = lobby.players.find(p => p.id === socket.id);
    if (!player) return;
    
    // Check if player already submitted
    const existingCaption = lobby.captions.find(c => c.playerId === socket.id);
    if (existingCaption) {
      existingCaption.text = caption;
    } else {
      lobby.captions.push({
        id: uuidv4(),
        playerId: socket.id,
        playerName: player.name,
        text: caption,
        votes: 0
      });
    }
    
    // Check if all players submitted
    if (lobby.captions.length === lobby.players.length) {
      startVotingPhase(lobby);
    }
    
    io.to(socket.lobbyCode).emit('captionSubmitted', { playerId: socket.id, caption });
  });

  // Vote for caption
  socket.on('voteCaption', ({ captionId }) => {
    const lobby = lobbies.get(socket.lobbyCode);
    
    if (!lobby || lobby.phase !== 'voting') {
      return;
    }
    
    const player = lobby.players.find(p => p.id === socket.id);
    if (!player) return;
    
    // Check if player already voted
    const existingVote = lobby.votes.find(v => v.playerId === socket.id);
    if (existingVote) {
      existingVote.captionId = captionId;
    } else {
      lobby.votes.push({
        playerId: socket.id,
        captionId: captionId
      });
    }
    
    // Update caption vote count
    const caption = lobby.captions.find(c => c.id === captionId);
    if (caption) {
      caption.votes = lobby.votes.filter(v => v.captionId === captionId).length;
    }
    
    // Check if all players voted
    if (lobby.votes.length === lobby.players.length) {
      endRound(lobby);
    }
    
    io.to(socket.lobbyCode).emit('voteSubmitted', { playerId: socket.id, captionId });
  });

  // Upload image
  socket.on('uploadImage', ({ imageData, imageName }) => {
    const lobby = lobbies.get(socket.lobbyCode);
    
    if (!lobby) return;
    
    // Add image to lobby
    lobby.images.push({
      id: uuidv4(),
      name: imageName,
      url: imageData,
      uploadedBy: socket.id
    });
    
    io.to(socket.lobbyCode).emit('imageUploaded', lobby.images);
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.lobbyCode) {
      const lobby = lobbies.get(socket.lobbyCode);
      
      if (lobby) {
        // Remove player from lobby
        lobby.players = lobby.players.filter(p => p.id !== socket.id);
        
        // If no players left, delete lobby
        if (lobby.players.length === 0) {
          lobbies.delete(socket.lobbyCode);
        } else {
          // If host left, assign new host
          if (lobby.hostId === socket.id) {
            lobby.hostId = lobby.players[0].id;
            lobby.players[0].isHost = true;
          }
          
          io.to(socket.lobbyCode).emit('lobbyUpdate', lobby);
        }
      }
    }
  });
});

// Game logic functions
function startRound(lobby) {
  lobby.phase = 'caption';
  lobby.captions = [];
  lobby.votes = [];
  
  // Select random image
  if (lobby.images.length > 0) {
    const randomIndex = Math.floor(Math.random() * lobby.images.length);
    lobby.currentImage = lobby.images[randomIndex];
  }
  
  // Set timer for caption phase (60 seconds)
  lobby.roundTimer = setTimeout(() => {
    if (lobby.phase === 'caption') {
      startVotingPhase(lobby);
    }
  }, 60000);
  
  io.to(lobby.id).emit('roundStarted', { 
    round: lobby.currentRound, 
    image: lobby.currentImage,
    phase: 'caption',
    timeLeft: 60
  });
}

function startVotingPhase(lobby) {
  lobby.phase = 'voting';
  
  // Shuffle captions for anonymity
  const shuffledCaptions = [...lobby.captions].sort(() => Math.random() - 0.5);
  
  io.to(lobby.id).emit('votingStarted', {
    captions: shuffledCaptions,
    phase: 'voting',
    timeLeft: 30
  });
  
  // Set timer for voting phase (30 seconds)
  lobby.roundTimer = setTimeout(() => {
    if (lobby.phase === 'voting') {
      endRound(lobby);
    }
  }, 30000);
}

function endRound(lobby) {
  lobby.phase = 'results';
  
  // Calculate scores
  lobby.votes.forEach(vote => {
    const caption = lobby.captions.find(c => c.id === vote.captionId);
    if (caption) {
      const player = lobby.players.find(p => p.id === caption.playerId);
      if (player) {
        player.score += 2; // +2 for receiving a vote
      }
    }
    
    // +1 bonus for voting
    const votingPlayer = lobby.players.find(p => p.id === vote.playerId);
    if (votingPlayer) {
      votingPlayer.score += 1;
    }
  });
  
  // Sort players by score
  lobby.players.sort((a, b) => b.score - a.score);
  
  io.to(lobby.id).emit('roundResults', {
    captions: lobby.captions,
    votes: lobby.votes,
    players: lobby.players,
    phase: 'results'
  });
  
  // Check if game is over
  if (lobby.currentRound >= lobby.totalRounds) {
    endGame(lobby);
  } else {
    // Start next round after 10 seconds
    setTimeout(() => {
      lobby.currentRound++;
      startRound(lobby);
    }, 10000);
  }
}

function endGame(lobby) {
  lobby.status = 'finished';
  lobby.phase = 'finished';
  
  io.to(lobby.id).emit('gameEnded', {
    players: lobby.players,
    finalScores: lobby.players.map(p => ({ name: p.name, score: p.score }))
  });
}

// Image upload endpoint
app.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    
    const imageUrl = `http://localhost:3001/uploads/${req.file.filename}`;
    res.json({ 
      success: true, 
      imageUrl: imageUrl,
      filename: req.file.filename 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Uploads directory: ${path.join(__dirname, 'uploads')}`);
});
