// server.js - Fixed server configuration
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

// Import your existing routes
import authRoutes from './src/controllers/authControlre.js';
import userRoutes from './src/controllers/userControler.js';
import assetsRoutes from './src/controllers/assetsController.js';

// Import new trading functionality
import tradingRoutes, { setupSocketNotifications, startTradeSettlement } from './src/controllers/tradeControler.js';

// Initialize environment
dotenv.config();
import('./src/config/db.js');

const PORT = process.env.PORT || 5000; // Changed to 5000 to match frontend
const app = express();
const server = http.createServer(app);

// CORS Middleware - Updated to include both origins
app.use(cors({
    origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173", // Added Vite dev server
        process.env.CLIENT_URL
    ].filter(Boolean), // Remove any undefined values
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.static('public'));

// Socket.io setup with proper CORS
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5173", // Added Vite dev server
            process.env.CLIENT_URL
        ].filter(Boolean),
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Setup socket notifications
setupSocketNotifications(io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/assets', assetsRoutes);

// Add a basic health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running',
        port: PORT
    });
});

// Handle preflight requests
// app.options('*', cors());

// Start trade settlement
startTradeSettlement();

// Start server
server.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔔 Socket.io enabled for real-time notifications`);
    console.log(`⚡ Trade settlement service active`);
    console.log(`🌐 CORS enabled for frontend origins`);
});