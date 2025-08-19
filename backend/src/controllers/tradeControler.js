// src/controllers/tradingController.js
import db from '../config/db.js';
import { Router } from "express";
import dotenv from 'dotenv';
import validateUserBalance from '../../utils/tradeHelper/validateUserBalance.js';
import updateUserBalance from '../../utils/tradeHelper/updateUserBalance.js';
import axios from 'axios';
import WebSocket from 'ws';
import verifyToken from '../middleware/auth.js';

// Binance API configuration
const BINANCE_API_BASE = 'https://api.binance.com/api/v3';
const BINANCE_WS_BASE = 'wss://stream.binance.com:9443/ws';
const PRICE_CACHE = new Map();

// Enhanced asset mapping with Binance symbols
const ASSET_MAPPING = {
    'BTC/USD': {
        type: 'crypto',
        binanceSymbol: 'BTCUSDT',
        id: 'bitcoin',
        currency: 'usd',
        stream: 'btcusdt@ticker'
    },
    'ETH/USD': {
        type: 'crypto',
        binanceSymbol: 'ETHUSDT',
        id: 'ethereum',
        currency: 'usd',
        stream: 'ethusdt@ticker'
    },
    'ADA/USD': {
        type: 'crypto',
        binanceSymbol: 'ADAUSDT',
        id: 'cardano',
        currency: 'usd',
        stream: 'adausdt@ticker'
    },
    'BNB/USD': {
        type: 'crypto',
        binanceSymbol: 'BNBUSDT',
        id: 'binancecoin',
        currency: 'usd',
        stream: 'bnbusdt@ticker'
    },
    'XRP/USD': {
        type: 'crypto',
        binanceSymbol: 'XRPUSDT',
        id: 'ripple',
        currency: 'usd',
        stream: 'xrpusdt@ticker'
    },
    'SOL/USD': {
        type: 'crypto',
        binanceSymbol: 'SOLUSDT',
        id: 'solana',
        currency: 'usd',
        stream: 'solusdt@ticker'
    },
    'DOT/USD': {
        type: 'crypto',
        binanceSymbol: 'DOTUSDT',
        id: 'polkadot',
        currency: 'usd',
        stream: 'dotusdt@ticker'
    },


    'LTC/USD': {
        type: 'crypto',
        binanceSymbol: 'LTCUSDT',
        id: 'litecoin',
        currency: 'usd',
        stream: 'ltcusdt@ticker'
    },
    'UNI/USD': {
        type: 'crypto',
        binanceSymbol: 'UNIUSDT',
        id: 'uniswap',
        currency: 'usd',
        stream: 'uniusdt@ticker'
    },

    'VET/USD': {
        type: 'crypto',
        binanceSymbol: 'VETUSDT',
        id: 'vechain',
        currency: 'usd',
        stream: 'vetusdt@ticker'
    }
};

const router = Router();
dotenv.config();

// Store for Socket.io instance and WebSocket connections
let io = null;
let binanceWS = null;

// Real-time price storage
const REAL_TIME_PRICES = new Map();

// Set Socket.io instance
const setSocketIO = (socketInstance) => {
    io = socketInstance;
};

// Initialize Binance WebSocket connections for real-time prices
const initializeBinanceWebSocket = () => {
    const cryptoAssets = Object.entries(ASSET_MAPPING)
        .filter(([_, asset]) => asset.type === 'crypto')
        .map(([symbol, asset]) => ({ symbol, ...asset }));

    if (cryptoAssets.length === 0) return;

    // Create combined stream for all crypto pairs
    const streams = cryptoAssets.map(asset => asset.stream).join('/');
    const wsUrl = `${BINANCE_WS_BASE}/${streams}`;

    console.log('🔗 Connecting to Binance WebSocket:', wsUrl);

    binanceWS = new WebSocket(wsUrl);

    binanceWS.on('open', () => {
        console.log('✅ Binance WebSocket connected');

        // Send ping every 30 seconds to keep connection alive
        const pingInterval = setInterval(() => {
            if (binanceWS.readyState === WebSocket.OPEN) {
                binanceWS.ping();
            } else {
                clearInterval(pingInterval);
            }
        }, 30000);
    });

    binanceWS.on('message', (data) => {
        try {
            const tickerData = JSON.parse(data);

            if (tickerData.stream && tickerData.data) {
                const { s: symbol, c: price, P: priceChangePercent, v: volume } = tickerData.data;

                // Find the asset symbol that matches this Binance symbol
                const assetEntry = Object.entries(ASSET_MAPPING)
                    .find(([_, asset]) => asset.binanceSymbol === symbol);

                if (assetEntry) {
                    const [assetSymbol, assetConfig] = assetEntry;
                    const realTimePrice = parseFloat(price);
                    const changePercent = parseFloat(priceChangePercent);
                    const vol = parseFloat(volume);

                    // Store real-time price data
                    REAL_TIME_PRICES.set(assetSymbol, {
                        price: realTimePrice,
                        changePercent,
                        volume: vol,
                        timestamp: Date.now(),
                        trend: changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'neutral',
                        source: 'binance_ws'
                    });

                    // Emit price update to all connected clients
                    if (io) {
                        io.emit('priceUpdate', {
                            symbol: assetSymbol,
                            price: realTimePrice,
                            change: changePercent,
                            trend: changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'neutral',
                            timestamp: Date.now()
                        });
                    }

                    // Cache the price
                    PRICE_CACHE.set(`price_${assetSymbol}`, {
                        price: realTimePrice,
                        timestamp: Date.now()
                    });
                }
            }
        } catch (error) {
            console.error('❌ Error parsing Binance WebSocket data:', error);
        }
    });

    binanceWS.on('error', (error) => {
        console.error('❌ Binance WebSocket error:', error);
    });

    binanceWS.on('close', (code, reason) => {
        console.log(`🔌 Binance WebSocket closed: ${code} - ${reason}`);

        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
            console.log('🔄 Attempting to reconnect to Binance WebSocket...');
            initializeBinanceWebSocket();
        }, 5000);
    });
};

// Get current price with Binance integration
const getCurrentPrice = async (assetSymbol) => {
    try {
        const asset = ASSET_MAPPING[assetSymbol];
        if (!asset) {
            throw new Error(`Unsupported asset: ${assetSymbol}`);
        }

        // For crypto assets, try real-time price first
        if (asset.type === 'crypto') {
            // Check real-time WebSocket price first
            const realTimePrice = REAL_TIME_PRICES.get(assetSymbol);
            if (realTimePrice && (Date.now() - realTimePrice.timestamp) < 5000) {
                console.log(`📡 Using real-time price for ${assetSymbol}: $${realTimePrice.price}`);
                return realTimePrice.price;
            }

            // Fallback to Binance REST API for fresh price
            try {
                const response = await axios.get(`${BINANCE_API_BASE}/ticker/price`, {
                    params: { symbol: asset.binanceSymbol },
                    timeout: 2000 // 2 second timeout for speed
                });

                const price = parseFloat(response.data.price);

                // Cache the price
                PRICE_CACHE.set(`price_${assetSymbol}`, {
                    price,
                    timestamp: Date.now()
                });

                console.log(`🔄 Binance REST API price for ${assetSymbol}: $${price}`);
                return price;

            } catch (binanceError) {
                console.error(`❌ Binance API error for ${assetSymbol}:`, binanceError.message);

                // Fallback to CoinGecko
                const response = await axios.get(
                    'https://api.coingecko.com/api/v3/simple/price',
                    {
                        params: {
                            ids: asset.id,
                            vs_currencies: asset.currency
                        },
                        timeout: 3000
                    }
                );

                const price = response.data[asset.id][asset.currency];
                console.log(`🦎 CoinGecko fallback price for ${assetSymbol}: $${price}`);
                return price;
            }
        }

        // For non-crypto assets, use existing logic
        let price;

        if (asset.type === 'forex') {
            price = await getForexPrice(asset.symbol);
        } else if (asset.type === 'commodity') {
            price = await getCommodityPrice(asset.symbol);
        }

        // Cache the price
        PRICE_CACHE.set(`price_${assetSymbol}`, {
            price,
            timestamp: Date.now()
        });

        return price;

    } catch (error) {
        console.error(`❌ Error fetching price for ${assetSymbol}:`, error.message);

        // Return cached price if available
        const cachedData = PRICE_CACHE.get(`price_${assetSymbol}`);
        if (cachedData) {
            console.log(`📦 Using cached price for ${assetSymbol}: $${cachedData.price}`);
            return cachedData.price;
        }

        // Fallback prices
        const fallbackPrices = {
            'BTC/USD': 45000,
            'ETH/USD': 2800,
            'BNB/USD': 300,
            'ADA/USD': 0.50,
            'SOL/USD': 100,
            'EUR/USD': 1.0850,
            'GBP/USD': 1.2650,
            'USD/JPY': 149.50,
            'GOLD': 2020,
            'OIL': 75.50
        };

        const fallbackPrice = fallbackPrices[assetSymbol] || 100;
        console.log(`⚠️  Using fallback price for ${assetSymbol}: $${fallbackPrice}`);
        return fallbackPrice;
    }
};

// Get enhanced market data with Binance integration
const getMarketData = async (assetSymbol) => {
    try {
        const asset = ASSET_MAPPING[assetSymbol];
        if (!asset) return null;

        if (asset.type === 'crypto') {
            // Try real-time data first
            const realTimeData = REAL_TIME_PRICES.get(assetSymbol);
            if (realTimeData && (Date.now() - realTimeData.timestamp) < 5000) {
                return {
                    price: realTimeData.price,
                    change: realTimeData.changePercent,
                    changePercent: realTimeData.changePercent,
                    volume: realTimeData.volume,
                    timestamp: realTimeData.timestamp,
                    trend: realTimeData.trend,
                    source: 'binance_realtime'
                };
            }

            // Fallback to Binance 24hr ticker
            try {
                const response = await axios.get(`${BINANCE_API_BASE}/ticker/24hr`, {
                    params: { symbol: asset.binanceSymbol },
                    timeout: 2000
                });

                const data = response.data;
                return {
                    price: parseFloat(data.lastPrice),
                    change: parseFloat(data.priceChange),
                    changePercent: parseFloat(data.priceChangePercent),
                    volume: parseFloat(data.volume),
                    high24h: parseFloat(data.highPrice),
                    low24h: parseFloat(data.lowPrice),
                    timestamp: Date.now(),
                    trend: parseFloat(data.priceChangePercent) > 0 ? 'up' :
                        parseFloat(data.priceChangePercent) < 0 ? 'down' : 'neutral',
                    source: 'binance_rest'
                };

            } catch (binanceError) {
                console.error(`❌ Binance market data error for ${assetSymbol}:`, binanceError.message);
                return null;
            }
        }

        // For non-crypto assets, return basic data
        const price = await getCurrentPrice(assetSymbol);
        return {
            price,
            change: 0,
            changePercent: 0,
            volume: 0,
            timestamp: Date.now(),
            trend: 'neutral',
            source: 'fallback'
        };

    } catch (error) {
        console.error(`❌ Error fetching market data for ${assetSymbol}:`, error);
        return null;
    }
};

// Calculate payout percentage based on market conditions
const calculatePayoutPercentage = (duration, assetSymbol, currentMarketData) => {
    const basePayout = 80; // 80% base payout
    const durationBonus = Math.min(duration / 10, 5); // Max 5% bonus for longer trades

    // Add volatility bonus based on real-time data
    let volatilityBonus = 0;
    if (currentMarketData && currentMarketData.changePercent) {
        volatilityBonus = Math.min(Math.abs(currentMarketData.changePercent) * 2, 10);
    }

    // Reduce payout slightly for high-frequency crypto pairs (house edge)
    let assetAdjustment = 0;
    if (ASSET_MAPPING[assetSymbol]?.type === 'crypto') {
        assetAdjustment = -2; // 2% reduction for crypto volatility
    }

    const randomFactor = Math.random() * 3; // Reduce randomness

    return Math.round(Math.min(basePayout + durationBonus + volatilityBonus + assetAdjustment + randomFactor, 92));
};

// Forex price fetcher (unchanged)
const getForexPrice = async (symbol) => {
    try {
        const mockPrices = {
            'EURUSD': 1.0850 + (Math.random() - 0.5) * 0.01,
            'GBPUSD': 1.2650 + (Math.random() - 0.5) * 0.01,
            'USDJPY': 149.50 + (Math.random() - 0.5) * 0.5
        };

        return mockPrices[symbol] || 1.0000;
    } catch (error) {
        console.error(`❌ Error fetching forex price for ${symbol}:`, error);
        return 1.0000;
    }
};

// Commodity price fetcher (unchanged)
const getCommodityPrice = async (symbol) => {
    try {
        const mockPrices = {
            'XAUUSD': 2020 + (Math.random() - 0.5) * 10,
            'CRUDE_OIL': 75.50 + (Math.random() - 0.5) * 2
        };

        return mockPrices[symbol] || 100;
    } catch (error) {
        console.error(`❌ Error fetching commodity price for ${symbol}:`, error);
        return 100;
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
        const userId = req.user.id;
        const { status = 'OPEN', limit = 10, offset = 0 } = req.query;

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

        // Format trades for frontend with real-time prices
        const formattedTrades = await Promise.all(trades.map(async (trade) => {
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

            // Get current price for active trades
            let currentPrice = null;
            if (trade.status === 'OPEN') {
                try {
                    currentPrice = await getCurrentPrice(trade.asset_symbol);
                } catch (error) {
                    console.error(`Error fetching current price for ${trade.asset_symbol}:`, error);
                }
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
                currentPrice,
                closePrice: trade.close_price,
                expiresAt: trade.expiry_time,
                startedAt: trade.start_time,
                isActive: trade.is_active,
                unrealizedPnL: currentPrice && trade.status === 'OPEN' ?
                    ((trade.trade_type === 'CALL' ? currentPrice - trade.entry_price : trade.entry_price - currentPrice) > 0 ? 'WINNING' : 'LOSING') : null
            };
        }));

        res.status(200).json({
            success: true,
            trades: formattedTrades
        });

    } catch (error) {
        console.error('❌ Error fetching user trades:', error);
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
        console.error('❌ Error fetching trade:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Updated createTrade function with Binance integration
const createTrade = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            assetSymbol,
            tradeType,
            stakeAmount,
            duration // in minutes
        } = req.body;

        console.log('📊 Creating trade:', { userId, assetSymbol, tradeType, stakeAmount, duration });

        // Validation
        if (!assetSymbol || !tradeType || !stakeAmount || !duration) {
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
        const supportedAssets = Object.keys(ASSET_MAPPING);
        if (!supportedAssets.includes(assetSymbol)) {
            return res.status(400).json({
                success: false,
                message: 'Unsupported asset',
                supportedAssets
            });
        }

        // Check user balance
        const balanceCheck = await validateUserBalance(userId, stakeAmount);
        if (!balanceCheck.valid) {
            return res.status(400).json({ success: false, message: balanceCheck.message });
        }

        // Get current price with Binance integration (ultra-low latency)
        const entryPrice = await getCurrentPrice(assetSymbol);
        console.log(`💰 Entry price for ${assetSymbol}: $${entryPrice}`);

        // Get enhanced market data
        const currentMarketData = await getMarketData(assetSymbol);

        // const payoutPercentage = await db.query(`SELCT `)
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
                    duration: duration,
                    entryPrice
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
                trend: 'neutral',
                source: 'fallback'
            }
        });

    } catch (error) {
        console.error('❌ Error creating trade:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Enhanced closeExpiredTrades with Binance real-time prices
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
                // Get current price with Binance integration (ultra-fast)
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
        const userId = req.user.id;

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
router.get('/trades/user', verifyToken, getUserTrades); //✅
router.get('/trades/stats', verifyToken, getUserTradingStats); //✅
router.get('/trades/:tradeId', verifyToken, getTradeById);
router.post('/trades', verifyToken, createTrade); //✅

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
