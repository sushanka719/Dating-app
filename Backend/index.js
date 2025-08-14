import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import authRoutes from './src/routes/auth.route.js';
import userRoutes from './src/routes/user.route.js';
import chatRoutes from './src/routes/chat.route.js';
import adminRoutes from './src/routes/admin.route.js'
import { connectDB } from './src/DB/connectDB.js';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import path from 'path';
import { Server } from 'socket.io';
import http from 'http';
import mongoose from 'mongoose';
import User from './src/models/user.js';
import ChatMessage from './src/models/ChatMessage.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  'http://localhost:3000', // Frontend app
  'http://localhost:3001', // Admin app
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // Match Express CORS origins
    methods: ['GET', 'POST'], // Explicitly allow methods
    credentials: true, // Allow credentials
  },
});

// Middleware
app.use(cookieParser());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., Postman) or allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/Uploads', express.static(path.join(__dirname, 'Uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', chatRoutes);
app.use('/api/admin', adminRoutes);

// Socket.IO
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('user-connected', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} is online`);
    socket.broadcast.emit('user-online', userId);
  });

  socket.on('send-message', async ({ sender, receiver, content }) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(sender) || !mongoose.Types.ObjectId.isValid(receiver)) {
        return socket.emit('error', { message: 'Invalid user ID' });
      }
      if (!content || !content.trim()) {
        return socket.emit('error', { message: 'Message content cannot be empty' });
      }

      const senderUser = await User.findById(sender).select('matches blocked');
      if (!senderUser) {
        return socket.emit('error', { message: 'Sender not found' });
      }

      const isMatched = senderUser.matches.some(
        (matchId) => matchId.toString() === receiver
      );
      if (!isMatched) {
        return socket.emit('error', { message: 'You can only message your matches' });
      }

      const isBlocked = senderUser.blocked?.some(
        (blockedId) => blockedId.toString() === receiver
      );
      if (isBlocked) {
        return socket.emit('error', { message: 'You cannot message a blocked user' });
      }

      const message = await ChatMessage.create({ sender, receiver, content });

      const formattedMessage = {
        _id: message._id,
        sender: message.sender,
        receiver: message.receiver,
        content: message.content,
        seen: message.seen,
        seenAt: message.seenAt,
        createdAt: message.createdAt,
      };

      const receiverSocketId = onlineUsers.get(receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive-message', formattedMessage);
      }
      socket.emit('receive-message', formattedMessage);
    } catch (err) {
      console.error('Error in send-message:', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('mark-seen', async ({ messageId }) => {
    try {
      const msg = await ChatMessage.findByIdAndUpdate(
        messageId,
        { seen: true, seenAt: new Date() },
        { new: true }
      );
      if (msg) {
        const senderSocketId = onlineUsers.get(msg.sender.toString());
        const receiverSocketId = onlineUsers.get(msg.receiver.toString());
        if (senderSocketId) {
          io.to(senderSocketId).emit('message-seen', { messageId: msg._id });
        }
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('message-seen', { messageId: msg._id });
        }
      }
    } catch (err) {
      console.error('Error in mark-seen:', err);
    }
  });

  socket.on('disconnect', () => {
    const userId = [...onlineUsers.entries()].find(([_, id]) => id === socket.id)?.[0];
    if (userId) {
      onlineUsers.delete(userId);
      console.log(`User ${userId} disconnected`);
      socket.broadcast.emit('user-offline', userId);
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
  connectDB();
});