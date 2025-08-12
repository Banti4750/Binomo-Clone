// server.js - Updated main server file
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import cors from 'cors';

// Import your existing routes
import authRoutes from './src/controllers/authControlre.js'; // Fixed filename
import userRoutes from './src/controllers/userControler.js'; // Fixed filename
import assetsRoutes from './src/controllers/assetsController.js'; // Fixed filename

// Import new trading functionality
import tradingRoutes, { setPriceService, startTradeSettlement } from './src/controllers/tradeControler.js'; // Fixed filename
import PriceService from './utils/PriceService.js';

// Initialize environment
dotenv.config();
import('./src/config/db.js');

const PORT = process.env.PORT || 3000;
const app = express();

// Create HTTP server for both Express and WebSocket
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({
    server,
    path: '/ws/prices',
    clientTracking: true
});

// Create price service instance
const priceService = new PriceService();

// Inject price service into trading controller
setPriceService(priceService);

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(express.static('public')); // Serve static files

// Basic route
app.get('/', (req, res) => {
    res.json({
        message: 'Binomo Clone API Server',
        status: 'Running',
        websocket: '/ws/prices',
        endpoints: {
            auth: '/api/auth',
            user: '/api/user',
            trading: '/api/trading'
        }
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/assets', assetsRoutes); // Assuming assets are part of trading

// WebSocket connection handling
wss.on('connection', (ws, request) => {
    const clientIp = request.socket.remoteAddress;
    console.log(`📱 New WebSocket client connected from ${clientIp}`);

    // Add connection to price service
    priceService.addWebSocketConnection(ws);

    // Handle client messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'subscribe':
                    // Handle subscription to specific assets
                    ws.subscribedAssets = data.assets || Object.keys(priceService.assetMapping);
                    console.log('📊 Client subscribed to:', ws.subscribedAssets);

                    // Send immediate price update for subscribed assets
                    const subscribedPrices = {};
                    ws.subscribedAssets.forEach(asset => {
                        subscribedPrices[asset] = priceService.getAllPrices()[asset];
                    });

                    ws.send(JSON.stringify({
                        type: 'subscribed',
                        data: subscribedPrices
                    }));
                    break;

                case 'ping':
                    // Handle ping/pong for connection health
                    ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
                    break;

                case 'getUserTrades':
                    // Handle real-time trade updates request
                    if (data.userId) {
                        ws.userId = data.userId;
                        console.log(`👤 User ${data.userId} connected for trade updates`);
                    }
                    break;

                default:
                    console.log('❓ Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid message format'
            }));
        }
    });

    // Handle connection errors
    ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
    });

    // Handle client disconnect
    ws.on('close', (code, reason) => {
        console.log(`📱 WebSocket client disconnected: ${code} ${reason}`);
    });

    // Send welcome message with current server time
    ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Connected to Binomo Clone WebSocket',
        serverTime: new Date().toISOString(),
        availableAssets: Object.keys(priceService.assetMapping)
    }));
});

// Listen for price updates and broadcast to WebSocket clients
priceService.on('priceUpdate', ({ asset, data }) => {
    // Broadcast to all connected clients
    wss.clients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN = 1
            // Only send if client is subscribed to this asset
            if (!client.subscribedAssets || client.subscribedAssets.includes(asset)) {
                client.send(JSON.stringify({
                    type: 'priceUpdate',
                    asset,
                    data
                }));
            }
        }
    });
});

// Broadcast trade updates (when trades are created/closed)
export const broadcastTradeUpdate = (userId, tradeData) => {
    wss.clients.forEach(client => {
        if (client.readyState === 1 && client.userId === userId) { // WebSocket.OPEN = 1
            client.send(JSON.stringify({
                type: 'tradeUpdate',
                data: tradeData
            }));
        }
    });
};

// Health check endpoint for WebSocket
app.get('/api/ws/health', (req, res) => {
    res.json({
        websocket: {
            status: 'active',
            connectedClients: wss.clients.size,
            path: '/ws/prices'
        },
        priceService: {
            status: 'running',
            lastUpdate: Math.max(...Object.values(priceService.getAllPrices()).map(p => p.timestamp)),
            supportedAssets: Object.keys(priceService.assetMapping)
        }
    });
});

// API endpoint to get WebSocket stats (admin use)
app.get('/api/ws/stats', (req, res) => {
    const clients = Array.from(wss.clients).map(client => ({
        readyState: client.readyState,
        subscribedAssets: client.subscribedAssets || [],
        userId: client.userId || null
    }));

    res.json({
        totalClients: wss.clients.size,
        clients,
        priceService: {
            totalAssets: Object.keys(priceService.assetMapping).length,
            lastUpdates: Object.fromEntries(
                Object.entries(priceService.getAllPrices()).map(([asset, data]) => [
                    asset,
                    new Date(data.timestamp).toISOString()
                ])
            )
        }
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('❌ Server Error:', error);
    res.status(500).json({
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
});

// FIXED: 404 handler with named wildcard parameter
app.use('*catchall', (req, res) => {
    res.status(404).json({
        message: 'API endpoint not found',
        path: req.originalUrl
    });
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);

    // Close all WebSocket connections
    wss.clients.forEach(client => {
        client.send(JSON.stringify({
            type: 'serverShutdown',
            message: 'Server is shutting down'
        }));
        client.close(1001, 'Server shutdown');
    });

    // Close WebSocket server
    wss.close(() => {
        console.log('🔌 WebSocket server closed');
    });

    // Close HTTP server
    server.close(() => {
        console.log('🛑 HTTP server closed');
        process.exit(0);
    });

    // Force close after 30 seconds
    setTimeout(() => {
        console.error('⚠️  Forced shutdown after timeout');
        process.exit(1);
    }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
});

// Start the services
const startServer = async () => {
    try {
        // Start price service
        priceService.startRealTimeUpdates();
        console.log('💰 Price service started');

        // Start trade settlement
        startTradeSettlement();
        console.log('⚖️  Trade settlement started');

        // Start HTTP server with WebSocket support
        server.listen(PORT, () => {
            console.log(`\n🚀 Server running on port ${PORT}`);
            console.log(`📊 HTTP API: http://localhost:${PORT}`);
            console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws/prices`);
            console.log(`📋 Health Check: http://localhost:${PORT}/api/ws/health`);
            console.log(`📊 Stats: http://localhost:${PORT}/api/ws/stats\n`);

            // Show available free APIs
            console.log('🔧 Free APIs Configuration:');
            console.log('   ✅ ExchangeRate API (Forex) - No key required');
            console.log('   ✅ Binance API (Crypto) - No key required');
            console.log('   ⚠️  Alpha Vantage API (Commodities) - Requires free key');
            console.log('   💡 Get Alpha Vantage key: https://www.alphavantage.co/support/#api-key\n');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();