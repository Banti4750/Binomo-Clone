// src/controllers/tradingController.js
import db from '../config/db.js';
import { Router } from "express";
import dotenv from 'dotenv';
import validateUserBalance from '../../utils/tradeHelper/validateUserBalance.js';
import updateUserBalance from '../../utils/tradeHelper/updateUserBalance.js';

import axios from 'axios'

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

// Import price service (will be injected from main server)
let priceService = null;

// Function to set price service instance
const setPriceService = (service) => {
    priceService = service;
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

// TRADING CONTROLLERS

// Get all trades for a user
const getUserTrades = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, limit = 50, offset = 0 } = req.query;

        let query = 'SELECT * FROM trades WHERE user_id = ? and is_active = false';
        let params = [userId];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [trades] = await db.query(query, params);
        res.status(200).json(trades);
    } catch (error) {
        console.error('Error fetching user trades:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create a new trade
// const createTrade = async (req, res) => {
//     try {
//         const {
//             userId,
//             assetSymbol,
//             tradeType,
//             stakeAmount,
//             duration // in minutes
//         } = req.body;

//         console.log(tradeType)

//         // Validation
//         if (!userId || !assetSymbol || !tradeType || !stakeAmount || !duration) {
//             return res.status(400).json({ message: 'All fields are required' });
//         }

//         if (!['CALL', 'PUT'].includes(tradeType)) {
//             return res.status(400).json({ message: 'Trade type must be CALL or PUT' });
//         }

//         if (stakeAmount < 1 || stakeAmount > 10000) {
//             return res.status(400).json({ message: 'Stake amount must be between $1 and $10,000' });
//         }

//         if (duration < 1 || duration > 60) {
//             return res.status(400).json({ message: 'Trade duration must be between 1-60 minutes' });
//         }

//         // Check if asset is supported
//         const supportedAssets = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'BTC/USD', 'ETH/USD', 'GOLD', 'OIL'];
//         if (!supportedAssets.includes(assetSymbol)) {
//             return res.status(400).json({ message: 'Unsupported asset' });
//         }

//         // Check user balance
//         const balanceCheck = await validateUserBalance(userId, stakeAmount);
//         if (!balanceCheck.valid) {
//             return res.status(400).json({ message: balanceCheck.message });
//         }

//         // Get current price and market data
//         const entryPrice = getCurrentPrice(assetSymbol);
//         console.log(entryPrice);
//         const currentMarketData = priceService ? priceService.getAllPrices()[assetSymbol] : null;
//         const payoutPercentage = calculatePayoutPercentage(duration, assetSymbol, currentMarketData);

//         const startTime = new Date();
//         const expiryTime = new Date(startTime.getTime() + (duration * 60 * 1000));

//         // Deduct stake amount from user balance
//         await updateUserBalance(userId, stakeAmount, 'subtract');

//         // Create trade record
//         const [result] = await db.query(`
//             INSERT INTO trades (
//                 user_id, asset_symbol, trade_type, stake_amount,
//                 payout_percentage, entry_price, start_time, expiry_time, status
//             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'OPEN')
//         `, [userId, assetSymbol, tradeType, stakeAmount, payoutPercentage, entryPrice, startTime, expiryTime]);

//         res.status(201).json({
//             message: 'Trade created successfully',
//             tradeId: result.insertId,
//             entryPrice,
//             payoutPercentage,
//             expiryTime,
//             estimatedPayout: Math.round(stakeAmount * (payoutPercentage / 100)),
//             currentMarketData: currentMarketData || {
//                 price: entryPrice,
//                 change: 0,
//                 changePercent: 0,
//                 timestamp: Date.now(),
//                 trend: 'neutral'
//             }
//         });
//     } catch (error) {
//         console.error('Error creating trade:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };

// Close expired trades and calculate results
// const closeExpiredTrades = async () => {
//     try {
//         const now = new Date();

//         // Get all open trades that have expired
//         const [expiredTrades] = await db.query(`
//             SELECT id, user_id, asset_symbol, trade_type, stake_amount,
//                    payout_percentage, entry_price, expiry_time
//             FROM trades
//             WHERE status = 'OPEN' AND expiry_time <= ?
//         `, [now]);

//         for (const trade of expiredTrades) {
//             const closePrice = getCurrentPrice(trade.asset_symbol);
//             let status = 'LOSS';
//             let profitLoss = -trade.stake_amount;

//             // Determine if trade won or lost
//             const priceDifference = closePrice - trade.entry_price;
//             const priceMovedUp = priceDifference > 0;
//             const priceMovedDown = priceDifference < 0;

//             // For very small price movements, consider it a tie (loss for house edge)
//             const minimumMovement = trade.entry_price * 0.0001; // 0.01% minimum movement

//             if (Math.abs(priceDifference) < minimumMovement) {
//                 status = 'LOSS'; // No significant movement = loss
//             } else if ((trade.trade_type === 'CALL' && priceMovedUp) ||
//                 (trade.trade_type === 'PUT' && priceMovedDown)) {
//                 status = 'WIN';
//                 const payout = (trade.stake_amount * trade.payout_percentage / 100);
//                 profitLoss = payout;

//                 // Add winnings to user balance (stake + profit)
//                 await updateUserBalance(trade.user_id, parseInt(trade.stake_amount) + parseInt(profitLoss), 'add');
//             }

//             // Update trade record
//             await db.query(`
//             UPDATE trades
//             SET status = ?, close_price = ?, profit_loss = ?, updated_at = NOW(), is_active = ?
//                 WHERE id = ?
//             `, [status, closePrice, profitLoss, true, trade.id]);


//             console.log(`💰 Trade ${trade.id} closed: ${status}, Entry: ${trade.entry_price}, Close: ${closePrice}, P&L: ${profitLoss}`);
//         }

//         if (expiredTrades.length > 0) {
//             console.log(`⚡ Processed ${expiredTrades.length} expired trades`);
//         }
//     } catch (error) {
//         console.error('Error closing expired trades:', error);
//     }
// };

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
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (!['CALL', 'PUT'].includes(tradeType)) {
            return res.status(400).json({ message: 'Trade type must be CALL or PUT' });
        }

        if (stakeAmount < 1 || stakeAmount > 10000) {
            return res.status(400).json({ message: 'Stake amount must be between $1 and $10,000' });
        }

        if (duration < 1 || duration > 60) {
            return res.status(400).json({ message: 'Trade duration must be between 1-60 minutes' });
        }

        // Check if asset is supported
        const supportedAssets = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'BTC/USD', 'ETH/USD', 'GOLD', 'OIL'];
        if (!supportedAssets.includes(assetSymbol)) {
            return res.status(400).json({ message: 'Unsupported asset' });
        }

        // Check user balance
        const balanceCheck = await validateUserBalance(userId, stakeAmount);
        if (!balanceCheck.valid) {
            return res.status(400).json({ message: balanceCheck.message });
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
                payout_percentage, entry_price, start_time, expiry_time, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'OPEN')
        `, [userId, assetSymbol, tradeType, stakeAmount, payoutPercentage, entryPrice, startTime, expiryTime]);

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

// Updated closeExpiredTrades function
const closeExpiredTrades = async () => {
    try {
        const now = new Date();

        // Get all open trades that have expired
        const [expiredTrades] = await db.query(`
            SELECT id, user_id, asset_symbol, trade_type, stake_amount,
                   payout_percentage, entry_price, expiry_time
            FROM trades
            WHERE status = 'OPEN' AND expiry_time <= ?
        `, [now]);

        console.log(`🔄 Processing ${expiredTrades.length} expired trades...`);

        for (const trade of expiredTrades) {
            try {
                // Get current price from CoinGecko/APIs
                const closePrice = await getCurrentPrice(trade.asset_symbol);
                let status = 'LOSS';
                let profitLoss = -trade.stake_amount;

                // Determine if trade won or lost
                const priceDifference = closePrice - trade.entry_price;
                const priceMovedUp = priceDifference > 0;
                const priceMovedDown = priceDifference < 0;

                // For very small price movements, consider it a tie (loss for house edge)
                const minimumMovement = trade.entry_price * 0.0001; // 0.01% minimum movement

                if (Math.abs(priceDifference) < minimumMovement) {
                    status = 'LOSS'; // No significant movement = loss
                } else if ((trade.trade_type === 'CALL' && priceMovedUp) ||
                    (trade.trade_type === 'PUT' && priceMovedDown)) {
                    status = 'WIN';
                    const payout = (trade.stake_amount * trade.payout_percentage / 100);
                    profitLoss = payout;

                    // Add winnings to user balance (stake + profit)
                    await updateUserBalance(trade.user_id, parseInt(trade.stake_amount) + parseInt(profitLoss), 'add');
                }

                // Update trade record
                await db.query(`
                    UPDATE trades
                    SET status = ?, close_price = ?, profit_loss = ?, updated_at = NOW(), is_active = ?
                    WHERE id = ?
                `, [status, closePrice, profitLoss, true, trade.id]);

                console.log(`💰 Trade ${trade.id} (${trade.asset_symbol}) closed: ${status}`);
                console.log(`   Entry: $${trade.entry_price} → Close: $${closePrice} | P&L: $${profitLoss}`);

            } catch (priceError) {
                console.error(`❌ Error processing trade ${trade.id}:`, priceError.message);
                // Mark trade as error status
                await db.query(`
                    UPDATE trades
                    SET status = 'ERROR', updated_at = NOW()
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

// Get current asset prices
const getAssetPrices = async (req, res) => {
    try {
        if (!priceService) {
            return res.status(503).json({ message: 'Price service not available' });
        }

        res.status(200).json(priceService.getAllPrices());
    } catch (error) {
        console.error('Error fetching asset prices:', error);
        res.status(500).json({ message: 'Internal server error' });
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
            ...stats[0],
            win_rate: winRate,
            net_profit: netProfit,
            completed_trades: completedTrades
        });
    } catch (error) {
        console.error('Error fetching trading stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Get user balance
const getUserBalance = async (req, res) => {
    try {
        const { userId } = req.params;

        const [user] = await db.query('SELECT balance FROM users WHERE id = ?', [userId]);

        if (!user.length) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ balance: user[0].balance });
    } catch (error) {
        console.error('Error fetching user balance:', error);
        res.status(500).json({ message: 'Internal server error' });
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

// ROUTES - Fixed the problematic route
router.get('/trades/user/:userId', getUserTrades);//✅
router.get('/trades/stats/:userId', getUserTradingStats);//✅
router.get('/trades/:tradeId', getTradeById);
router.get('/balance/:userId', getUserBalance);//✅
router.get('/assets/prices', getAssetPrices);//✅
router.post('/trades', createTrade);//✅

// Export everything needed
export default router;
export { startTradeSettlement, stopTradeSettlement, setPriceService };