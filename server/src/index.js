require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const authRoutes = require('./routes/auth');
const pollRoutes = require('./routes/polls');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/poll-app')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);

// Store active polls and sessions
const activePolls = new Map();
const sessions = new Map();

// Generate a random session code
const generateSessionCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  // Create a new poll session
  socket.on('createPoll', (pollData) => {
    const sessionCode = generateSessionCode();
    const poll = {
      id: sessionCode,
      question: pollData.question,
      options: pollData.options,
      votes: new Array(pollData.options.length).fill(0),
      participants: new Set(),
      createdBy: socket.id
    };
    
    activePolls.set(sessionCode, poll);
    sessions.set(socket.id, sessionCode);
    
    socket.join(sessionCode);
    socket.emit('pollCreated', { sessionCode, poll });
  });

  // Join a poll session
  socket.on('joinPoll', (sessionCode) => {
    const poll = activePolls.get(sessionCode);
    if (poll) {
      socket.join(sessionCode);
      sessions.set(socket.id, sessionCode);
      poll.participants.add(socket.id);
      socket.emit('pollJoined', { poll });
      io.to(sessionCode).emit('participantJoined', { 
        participantsCount: poll.participants.size 
      });
    } else {
      socket.emit('error', { message: 'Invalid session code' });
    }
  });

  // Submit a vote
  socket.on('submitVote', ({ sessionCode, optionIndex }) => {
    const poll = activePolls.get(sessionCode);
    if (poll && poll.participants.has(socket.id)) {
      poll.votes[optionIndex]++;
      io.to(sessionCode).emit('pollUpdate', { votes: poll.votes });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    const sessionCode = sessions.get(socket.id);
    if (sessionCode) {
      const poll = activePolls.get(sessionCode);
      if (poll) {
        poll.participants.delete(socket.id);
        if (poll.participants.size === 0) {
          activePolls.delete(sessionCode);
        } else {
          io.to(sessionCode).emit('participantLeft', {
            participantsCount: poll.participants.size
          });
        }
      }
      sessions.delete(socket.id);
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

// Function to find an available port
const findAvailablePort = async (startPort) => {
  const net = require('net');
  
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
    
    server.listen(startPort, () => {
      server.close(() => {
        resolve(startPort);
      });
    });
  });
};

// Start server with port handling
findAvailablePort(PORT)
  .then(port => {
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
      // Update the client's socket connection URL if needed
      process.env.REACT_APP_SERVER_PORT = port;
    });
  })
  .catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  }); 