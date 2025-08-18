// server.js - Updated main server file
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Import your existing routes
import authRoutes from './src/controllers/authControlre.js'; // Fixed filename
import userRoutes from './src/controllers/userControler.js'; // Fixed filename
import assetsRoutes from './src/controllers/assetsController.js'; // Fixed filename

// Import new trading functionality
import tradingRoutes from './src/controllers/tradeControler.js'; // Fixed filename

// Initialize environment
dotenv.config();
import('./src/config/db.js');

const PORT = process.env.PORT || 3000;
const app = express();


// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(express.static('public')); // Serve static files

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/assets', assetsRoutes); // Assuming assets are part of trading


app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});