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

// Define allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://dot-burster-6.onrender.com',
  'https://dot-burster-1.onrender.com'
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
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

// CORS Middleware - Must be before other middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // For legacy browser support
}));

// Handle preflight requests
app.options('*', cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/admin', adminRoutes);

// Setup Socket.IO for game functionality
setupGameSocket(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌟 Server running on port ${PORT}`);
  console.log(`🔗 Frontend URL: https://dot-burster-6.onrender.com`);
  console.log(`🔗 Backend URL: https://dot-burster-1.onrender.com`);
  console.log(`👨‍💼 Admin Panel: https://dot-burster-6.onrender.com/admin`);
  console.log(`🌍 Allowed Origins:`, allowedOrigins);
  console.log(`🔧 Environment:`, process.env.NODE_ENV || 'development');
});
