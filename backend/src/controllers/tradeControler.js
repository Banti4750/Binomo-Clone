// src/controllers/tradingController.js
import db from '../config/db.js';
import { Router } from "express";
import dotenv from 'dotenv';
import validateUserBalance from '../../utils/tradeHelper/validateUserBalance.js';
import updateUserBalance from '../../utils/tradeHelper/updateUserBalance.js';
import axios from 'axios';

// CoinGecko API configuration
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
const PRICE_CACHE = new Map();
const CACHE_DURATION = 30000; // 30 seconds cache

const ASSET_MAPPING = {
    'BTC/USD': { type: 'crypto', id: 'bitcoin', currency: 'usd' },
    'ETH/USD': { type: 'crypto', id: 'ethereum', currency: 'usd' },
    'EUR/USD': { type: 'forex', symbol: 'EURUSD' },
    'GBP/USD': { type: 'forex', symbol: 'GBPUSD' },
    'USD/JPY': { type: 'forex', symbol: 'USDJPY' },
    'GOLD': { type: 'commodity', symbol: 'XAUUSD' },
    'OIL': { type: 'commodity', symbol: 'CRUDE_OIL' }
};

const router = Router();
dotenv.config();

// Store for Socket.io instance (will be set from server)
let io = null;

// Set Socket.io instance
const setSocketIO = (socketInstance) => {
    io = socketInstance;
};

// Calculate payout percentage based on market conditions
const calculatePayoutPercentage = (duration, assetSymbol, currentMarketData) => {
    const basePayout = 80; // 80% base payout
    const durationBonus = Math.min(duration / 10, 5); // Max 5% bonus for longer trades

    // Add volatility bonus
    let volatilityBonus = 0;
    if (currentMarketData && currentMarketData.changePercent) {
        volatilityBonus = Math.min(Math.abs(currentMarketData.changePercent) * 2, 10);
    }

    const randomFactor = Math.random() * 5; // Add some randomness

    return Math.round(Math.min(basePayout + durationBonus + volatilityBonus + randomFactor, 95));
};

// Get current price from CoinGecko or other APIs
const getCurrentPrice = async (assetSymbol) => {
    try {
        const cacheKey = `price_${assetSymbol}`;
        const cachedData = PRICE_CACHE.get(cacheKey);

        // Return cached price if still valid
        if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
            return cachedData.price;
        }

        const asset = ASSET_MAPPING[assetSymbol];
        if (!asset) {
            throw new Error(`Unsupported asset: ${assetSymbol}`);
        }

        let price;

        if (asset.type === 'crypto') {
            // Fetch cryptocurrency prices from CoinGecko
            const response = await axios.get(
                `${COINGECKO_API_BASE}/simple/price`,
                {
                    params: {
                        ids: asset.id,
                        vs_currencies: asset.currency,
                        include_24hr_change: true
                    },
                    timeout: 5000
                }
            );

            price = response.data[asset.id][asset.currency];

        } else if (asset.type === 'forex') {
            // For forex, you might want to use a different API or CoinGecko's forex data
            // Using a mock forex API call - replace with actual forex API
            const forexPrice = await getForexPrice(asset.symbol);
            price = forexPrice;

        } else if (asset.type === 'commodity') {
            // For commodities, use appropriate API
            const commodityPrice = await getCommodityPrice(asset.symbol);
            price = commodityPrice;
        }

        // Cache the price
        PRICE_CACHE.set(cacheKey, {
            price,
            timestamp: Date.now()
        });

        return price;

    } catch (error) {
        console.error(`Error fetching price for ${assetSymbol}:`, error.message);

        // Return cached price if API fails
        const cachedData = PRICE_CACHE.get(`price_${assetSymbol}`);
        if (cachedData) {
            console.log(`Using cached price for ${assetSymbol}`);
            return cachedData.price;
        }

        // Fallback prices if no cache available
        const fallbackPrices = {
            'BTC/USD': 45000,
            'ETH/USD': 2800,
            'EUR/USD': 1.0850,
            'GBP/USD': 1.2650,
            'USD/JPY': 149.50,
            'GOLD': 2020,
            'OIL': 75.50
        };

        return fallbackPrices[assetSymbol] || 100;
    }
};

// Forex price fetcher (replace with actual forex API)
const getForexPrice = async (symbol) => {
    try {
        // Example using Alpha Vantage, Fixer.io, or similar forex API
        // const response = await axios.get(`https://api.fixer.io/latest?base=EUR&symbols=USD`);

        // Mock implementation - replace with actual API call
        const mockPrices = {
            'EURUSD': 1.0850 + (Math.random() - 0.5) * 0.01,
            'GBPUSD': 1.2650 + (Math.random() - 0.5) * 0.01,
            'USDJPY': 149.50 + (Math.random() - 0.5) * 0.5
        };

        return mockPrices[symbol] || 1.0000;
    } catch (error) {
        console.error(`Error fetching forex price for ${symbol}:`, error);
        return 1.0000;
    }
};

// Commodity price fetcher
const getCommodityPrice = async (symbol) => {
    try {
        // You can use APIs like Alpha Vantage, Quandl, or commodity-specific APIs
        const mockPrices = {
            'XAUUSD': 2020 + (Math.random() - 0.5) * 10,
            'CRUDE_OIL': 75.50 + (Math.random() - 0.5) * 2
        };

        return mockPrices[symbol] || 100;
    } catch (error) {
        console.error(`Error fetching commodity price for ${symbol}:`, error);
        return 100;
    }
};

// Enhanced market data fetcher
const getMarketData = async (assetSymbol) => {
    try {
        const asset = ASSET_MAPPING[assetSymbol];
        if (!asset || asset.type !== 'crypto') {
            return null;
        }

        const response = await axios.get(
            `${COINGECKO_API_BASE}/simple/price`,
            {
                params: {
                    ids: asset.id,
                    vs_currencies: asset.currency,
                    include_24hr_change: true,
                    include_24hr_vol: true,
                    include_market_cap: true
                },
                timeout: 5000
            }
        );

        const data = response.data[asset.id];
        const change24h = data[`${asset.currency}_24h_change`] || 0;

        return {
            price: data[asset.currency],
            change: change24h,
            changePercent: change24h,
            volume: data[`${asset.currency}_24h_vol`] || 0,
            marketCap: data[`${asset.currency}_market_cap`] || 0,
            timestamp: Date.now(),
            trend: change24h > 0 ? 'up' : change24h < 0 ? 'down' : 'neutral'
        };

    } catch (error) {
        console.error(`Error fetching market data for ${assetSymbol}:`, error);
        return null;
    }
};

// Send real-time notification to user
const sendTradeNotification = (userId, tradeData, result) => {
    if (io) {
        io.to(`user_${userId}`).emit('tradeResult', {
            tradeId: tradeData.id,
            result, // 'WIN' or 'LOSS'
            trade: {
                pair: tradeData.asset_symbol,
                direction: tradeData.trade_type,
                amount: tradeData.stake_amount,
                payout: tradeData.profit_loss,
                entryPrice: tradeData.entry_price,
                closePrice: tradeData.close_price
            },
            timestamp: new Date().toISOString()
        });

        console.log(`📢 Notification sent to user ${userId}: Trade ${tradeData.id} - ${result}`);
    }
};

// TRADING CONTROLLERS

// Get all trades for a user with enhanced formatting
const getUserTrades = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status = 'OPEN', limit = 50, offset = 0 } = req.query;

        let query = `
            SELECT id, user_id, asset_symbol, trade_type, stake_amount,
                   payout_percentage, entry_price, close_price, start_time,
                   expiry_time, status, profit_loss, is_active, created_at, updated_at
            FROM trades
            WHERE user_id = ?
        `;
        let params = [userId];

        if (status !== 'ALL') {
            if (status === 'OPEN') {
                query += ' AND status = ? AND is_active = true';
            } else {
                query += ' AND status = ?';
            }
            params.push(status);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [trades] = await db.query(query, params);

        // Format trades for frontend
        const formattedTrades = trades.map(trade => {
            const now = new Date();
            const expiryTime = new Date(trade.expiry_time);
            const isExpired = now >= expiryTime;

            // Calculate time remaining
            let timeLeft = '0:00';
            let progress = 100;

            if (!isExpired && trade.status === 'OPEN') {
                const timeRemaining = expiryTime - now;
                const minutes = Math.floor(timeRemaining / 60000);
                const seconds = Math.floor((timeRemaining % 60000) / 1000);
                timeLeft = `${minutes}:${seconds.toString().padStart(2, '0')}`;

                // Calculate progress
                const startTime = new Date(trade.start_time);
                const totalDuration = expiryTime - startTime;
                const elapsed = now - startTime;
                progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
            }

            return {
                id: trade.id,
                pair: trade.asset_symbol,
                direction: trade.trade_type,
                amount: trade.stake_amount,
                timeLeft,
                progress,
                status: trade.status,
                result: trade.status === 'CLOSED' ? (trade.profit_loss > 0 ? 'WIN' : 'LOSS') : null,
                payout: trade.profit_loss || 0,
                entryPrice: trade.entry_price,
                closePrice: trade.close_price,
                expiresAt: trade.expiry_time,
                startedAt: trade.start_time,
                isActive: trade.is_active
            };
        });

        res.status(200).json({
            success: true,
            trades: formattedTrades
        });

    } catch (error) {
        console.error('Error fetching user trades:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get trade by ID
const getTradeById = async (req, res) => {
    try {
        const { tradeId } = req.params;

        const [trades] = await db.query('SELECT * FROM trades WHERE id = ?', [tradeId]);

        if (!trades.length) {
            return res.status(404).json({ message: 'Trade not found' });
        }

        res.status(200).json(trades[0]);
    } catch (error) {
        console.error('Error fetching trade:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Updated createTrade function
const createTrade = async (req, res) => {
    try {
        const {
            userId,
            assetSymbol,
            tradeType,
            stakeAmount,
            duration // in minutes
        } = req.body;

        console.log('Trade Type:', tradeType);

        // Validation
        if (!userId || !assetSymbol || !tradeType || !stakeAmount || !duration) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        if (!['CALL', 'PUT'].includes(tradeType)) {
            return res.status(400).json({ success: false, message: 'Trade type must be CALL or PUT' });
        }

        if (stakeAmount < 1 || stakeAmount > 10000) {
            return res.status(400).json({ success: false, message: 'Stake amount must be between $1 and $10,000' });
        }

        if (duration < 1 || duration > 60) {
            return res.status(400).json({ success: false, message: 'Trade duration must be between 1-60 minutes' });
        }

        // Check if asset is supported
        const supportedAssets = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'BTC/USD', 'ETH/USD', 'GOLD', 'OIL'];
        if (!supportedAssets.includes(assetSymbol)) {
            return res.status(400).json({ success: false, message: 'Unsupported asset' });
        }

        // Check user balance
        const balanceCheck = await validateUserBalance(userId, stakeAmount);
        if (!balanceCheck.valid) {
            return res.status(400).json({ success: false, message: balanceCheck.message });
        }

        // Get current price from CoinGecko/APIs
        const entryPrice = await getCurrentPrice(assetSymbol);
        console.log('Entry Price:', entryPrice);

        // Get enhanced market data
        const currentMarketData = await getMarketData(assetSymbol);
        const payoutPercentage = calculatePayoutPercentage(duration, assetSymbol, currentMarketData);

        const startTime = new Date();
        const expiryTime = new Date(startTime.getTime() + (duration * 60 * 1000));

        // Deduct stake amount from user balance
        await updateUserBalance(userId, stakeAmount, 'subtract');

        // Create trade record
        const [result] = await db.query(`
            INSERT INTO trades (
                user_id, asset_symbol, trade_type, stake_amount,
                payout_percentage, entry_price, start_time, expiry_time, status, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', true)
        `, [userId, assetSymbol, tradeType, stakeAmount, payoutPercentage, entryPrice, startTime, expiryTime]);

        // Send trade creation notification
        if (io) {
            io.to(`user_${userId}`).emit('tradeCreated', {
                tradeId: result.insertId,
                message: `${tradeType} trade created for ${assetSymbol}`,
                trade: {
                    pair: assetSymbol,
                    direction: tradeType,
                    amount: stakeAmount,
                    duration: duration
                }
            });
        }

        res.status(201).json({
            success: true,
            message: 'Trade created successfully',
            tradeId: result.insertId,
            data: {
                userId,
                assetSymbol,
                tradeType,
                stakeAmount,
                duration,
                expiresAt: expiryTime
            },
            entryPrice,
            payoutPercentage,
            expiryTime,
            estimatedPayout: Math.round(stakeAmount * (payoutPercentage / 100)),
            currentMarketData: currentMarketData || {
                price: entryPrice,
                change: 0,
                changePercent: 0,
                timestamp: Date.now(),
                trend: 'neutral'
            }
        });

    } catch (error) {
        console.error('Error creating trade:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Enhanced closeExpiredTrades with notifications
const closeExpiredTrades = async () => {
    try {
        const now = new Date();

        // Get all open trades that have expired
        const [expiredTrades] = await db.query(`
            SELECT id, user_id, asset_symbol, trade_type, stake_amount,
                   payout_percentage, entry_price, expiry_time
            FROM trades
            WHERE status = 'OPEN' AND expiry_time <= ? AND is_active = true
        `, [now]);

        console.log(`🔄 Processing ${expiredTrades.length} expired trades...`);

        for (const trade of expiredTrades) {
            try {
                // Get current price from CoinGecko/APIs
                const closePrice = await getCurrentPrice(trade.asset_symbol);
                let status = 'LOSS';
                let profitLoss = -trade.stake_amount;
                let result = 'LOSS';

                // Determine if trade won or lost
                const priceDifference = closePrice - trade.entry_price;
                const priceMovedUp = priceDifference > 0;
                const priceMovedDown = priceDifference < 0;

                // For very small price movements, consider it a tie (loss for house edge)
                const minimumMovement = trade.entry_price * 0.0001; // 0.01% minimum movement

                if (Math.abs(priceDifference) < minimumMovement) {
                    status = 'LOSS'; // No significant movement = loss
                    result = 'LOSS';
                } else if ((trade.trade_type === 'CALL' && priceMovedUp) ||
                    (trade.trade_type === 'PUT' && priceMovedDown)) {
                    status = 'WIN';
                    result = 'WIN';
                    const payout = (trade.stake_amount * trade.payout_percentage / 100);
                    profitLoss = payout;

                    // Add winnings to user balance (stake + profit)
                    await updateUserBalance(trade.user_id, parseInt(trade.stake_amount) + parseInt(profitLoss), 'add');
                }

                // Update trade record
                await db.query(`
                    UPDATE trades
                    SET status = ?, close_price = ?, profit_loss = ?, updated_at = NOW(), is_active = false
                    WHERE id = ?
                `, [status, closePrice, profitLoss, trade.id]);

                console.log(`💰 Trade ${trade.id} (${trade.asset_symbol}) closed: ${result}`);
                console.log(`   Entry: $${trade.entry_price} → Close: $${closePrice} | P&L: $${profitLoss}`);

                // Send real-time notification to user
                sendTradeNotification(trade.user_id, {
                    id: trade.id,
                    asset_symbol: trade.asset_symbol,
                    trade_type: trade.trade_type,
                    stake_amount: trade.stake_amount,
                    profit_loss: profitLoss,
                    entry_price: trade.entry_price,
                    close_price: closePrice
                }, result);

            } catch (priceError) {
                console.error(`❌ Error processing trade ${trade.id}:`, priceError.message);
                // Mark trade as error status
                await db.query(`
                    UPDATE trades
                    SET status = 'ERROR', updated_at = NOW(), is_active = false
                    WHERE id = ?
                `, [trade.id]);
            }
        }

        if (expiredTrades.length > 0) {
            console.log(`⚡ Successfully processed ${expiredTrades.length} expired trades`);
        }

    } catch (error) {
        console.error('❌ Error closing expired trades:', error);
    }
};

// Get trading statistics for a user
const getUserTradingStats = async (req, res) => {
    try {
        const { userId } = req.params;

        const [stats] = await db.query(`
            SELECT
                COUNT(*) as total_trades,
                COUNT(CASE WHEN status = 'WIN' THEN 1 END) as wins,
                COUNT(CASE WHEN status = 'LOSS' THEN 1 END) as losses,
                COUNT(CASE WHEN status = 'OPEN' THEN 1 END) as active_trades,
                SUM(CASE WHEN status = 'WIN' THEN profit_loss ELSE 0 END) as total_profit,
                SUM(CASE WHEN status = 'LOSS' THEN ABS(profit_loss) ELSE 0 END) as total_loss,
                AVG(CASE WHEN status IN ('WIN', 'LOSS') THEN stake_amount END) as avg_stake,
                MAX(created_at) as last_trade_date
            FROM trades
            WHERE user_id = ?
        `, [userId]);

        const completedTrades = stats[0].wins + stats[0].losses;
        const winRate = completedTrades > 0
            ? ((stats[0].wins / completedTrades) * 100).toFixed(2)
            : 0;

        const netProfit = (stats[0].total_profit || 0) - (stats[0].total_loss || 0);

        res.status(200).json({
            success: true,
            stats: {
                ...stats[0],
                win_rate: winRate,
                net_profit: netProfit,
                completed_trades: completedTrades
            }
        });
    } catch (error) {
        console.error('Error fetching trading stats:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get user balance
const getUserBalance = async (req, res) => {
    try {
        const { userId } = req.params;

        const [user] = await db.query('SELECT balance FROM users WHERE id = ?', [userId]);

        if (!user.length) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            balance: user[0].balance
        });
    } catch (error) {
        console.error('Error fetching user balance:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Manual trade settlement endpoint (for testing)
const settleTrade = async (req, res) => {
    try {
        const { tradeId } = req.params;

        // Get trade details
        const [trades] = await db.query(`
            SELECT id, user_id, asset_symbol, trade_type, stake_amount,
                   payout_percentage, entry_price, expiry_time, status
            FROM trades
            WHERE id = ? AND status = 'OPEN'
        `, [tradeId]);

        if (trades.length === 0) {
            return res.status(404).json({ success: false, message: 'Trade not found or already closed' });
        }

        const trade = trades[0];

        // Get current price and close trade
        const closePrice = await getCurrentPrice(trade.asset_symbol);
        let status = 'LOSS';
        let profitLoss = -trade.stake_amount;
        let result = 'LOSS';

        // Determine if trade won or lost
        const priceDifference = closePrice - trade.entry_price;
        const priceMovedUp = priceDifference > 0;
        const priceMovedDown = priceDifference < 0;
        const minimumMovement = trade.entry_price * 0.0001;

        if (Math.abs(priceDifference) >= minimumMovement) {
            if ((trade.trade_type === 'CALL' && priceMovedUp) ||
                (trade.trade_type === 'PUT' && priceMovedDown)) {
                status = 'WIN';
                result = 'WIN';
                const payout = (trade.stake_amount * trade.payout_percentage / 100);
                profitLoss = payout;

                // Add winnings to user balance
                await updateUserBalance(trade.user_id, parseInt(trade.stake_amount) + parseInt(profitLoss), 'add');
            }
        }

        // Update trade record
        await db.query(`
            UPDATE trades
            SET status = ?, close_price = ?, profit_loss = ?, updated_at = NOW(), is_active = false
            WHERE id = ?
        `, [status, closePrice, profitLoss, trade.id]);

        // Send notification
        sendTradeNotification(trade.user_id, {
            ...trade,
            profit_loss: profitLoss,
            close_price: closePrice
        }, result);

        res.json({
            success: true,
            message: `Trade settled: ${result}`,
            trade: {
                id: trade.id,
                result,
                entryPrice: trade.entry_price,
                closePrice,
                profitLoss
            }
        });

    } catch (error) {
        console.error('Error settling trade:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Start trade settlement interval
let settlementInterval = null;

const startTradeSettlement = () => {
    if (settlementInterval) {
        clearInterval(settlementInterval);
    }

    // Run settlement every 30 seconds
    settlementInterval = setInterval(closeExpiredTrades, 30000);
    console.log('🔄 Trade settlement service started');
};

const stopTradeSettlement = () => {
    if (settlementInterval) {
        clearInterval(settlementInterval);
        settlementInterval = null;
        console.log('⏹️  Trade settlement service stopped');
    }
};

// Socket.io setup function
const setupSocketNotifications = (socketIO) => {
    io = socketIO;

    io.on('connection', (socket) => {
        console.log('👤 User connected:', socket.id);

        // Join user-specific room for notifications
        socket.on('joinUser', (userId) => {
            socket.join(`user_${userId}`);
            console.log(`✅ User ${userId} joined notification room`);

            // Send connection confirmation
            socket.emit('connected', {
                message: 'Connected to trade notifications',
                userId
            });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('👋 User disconnected:', socket.id);
        });
    });

    console.log('🔔 Socket.io notifications setup complete');
};

// ROUTES
router.get('/trades/user/:userId', getUserTrades); //✅
router.get('/trades/stats/:userId', getUserTradingStats); //✅
router.get('/trades/:tradeId', getTradeById);
router.get('/balance/:userId', getUserBalance); //✅
router.post('/trades', createTrade); //✅
router.put('/trades/settle/:tradeId', settleTrade); // Manual settlement for testing

// Export everything needed
export default router;
export {
    startTradeSettlement,
    stopTradeSettlement,
    setupSocketNotifications,
    setSocketIO,
    closeExpiredTrades,
    sendTradeNotification
};