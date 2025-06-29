import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { createDefaultAdmin } from './config/createDefaultAdmin.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import gameRoutes from './routes/game.js';
import adminRoutes from './routes/admin.js';
import { setupGameSocket } from './socket/gameSocket.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://dot-burster-6.onrender.com",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB and create default admin
const initializeApp = async () => {
  try {
    await connectDB();
    await createDefaultAdmin();
    console.log('🚀 Application initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    process.exit(1);
  }
};

initializeApp();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/admin', adminRoutes);

// Setup Socket.IO for game functionality
setupGameSocket(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🌟 Server running on port ${PORT}`);
  console.log(`🔗 Frontend URL: http://localhost:5173`);
  console.log(`🔗 Backend URL: http://localhost:${PORT}`);
  console.log(`👨‍💼 Admin Panel: http://localhost:5173/admin`);
});
