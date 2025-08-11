// src/controllers/tradingController.js
import db from '../config/db.js';
import { Router } from "express";
import dotenv from 'dotenv';

const router = Router();
dotenv.config();

// Import price service (will be injected from main server)
let priceService = null;

// Function to set price service instance
const setPriceService = (service) => {
    priceService = service;
};

// Validate user balance before trade
const validateUserBalance = async (userId, amount) => {
    try {
        const [user] = await db.query('SELECT balance FROM users WHERE id = ?', [userId]);
        if (!user.length) return { valid: false, message: 'User not found' };

        if (user[0].balance < amount) {
            return { valid: false, message: 'Insufficient balance' };
        }

        return { valid: true, balance: user[0].balance };
    } catch (error) {
        return { valid: false, message: 'Database error' };
    }
};

// Update user balance
const updateUserBalance = async (userId, amount, operation = 'subtract') => {
    try {
        const query = operation === 'add'
            ? 'UPDATE users SET balance = balance + ? WHERE id = ?'
            : 'UPDATE users SET balance = balance - ? WHERE id = ?';

        await db.query(query, [amount, userId]);
        return true;
    } catch (error) {
        console.error('Error updating user balance:', error);
        return false;
    }
};

// Get current price from price service
const getCurrentPrice = (assetSymbol) => {
    if (!priceService) {
        console.warn('Price service not initialized, using fallback prices');
        const fallbackPrices = {
            'EUR/USD': 1.0875,
            'GBP/USD': 1.2750,
            'USD/JPY': 149.25,
            'BTC/USD': 45000.00,
            'ETH/USD': 2800.00,
            'GOLD': 2050.00,
            'OIL': 85.50
        };
        return fallbackPrices[assetSymbol] || 100;
    }
    return priceService.getCurrentPrice(assetSymbol);
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

        let query = 'SELECT * FROM trades WHERE user_id = ?';
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
const createTrade = async (req, res) => {
    try {
        const {
            userId,
            assetSymbol,
            tradeType,
            stakeAmount,
            duration // in minutes
        } = req.body;

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

        // Get current price and market data
        const entryPrice = getCurrentPrice(assetSymbol);
        const currentMarketData = priceService ? priceService.getAllPrices()[assetSymbol] : null;
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
            message: 'Trade created successfully',
            tradeId: result.insertId,
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
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Close expired trades and calculate results
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

        for (const trade of expiredTrades) {
            const closePrice = getCurrentPrice(trade.asset_symbol);
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
                await updateUserBalance(trade.user_id, trade.stake_amount + payout, 'add');
            }

            // Update trade record
            await db.query(`
                UPDATE trades
                SET status = ?, close_price = ?, profit_loss = ?, updated_at = NOW()
                WHERE id = ?
            `, [status, closePrice, profitLoss, trade.id]);

            console.log(`💰 Trade ${trade.id} closed: ${status}, Entry: ${trade.entry_price}, Close: ${closePrice}, P&L: ${profitLoss}`);
        }

        if (expiredTrades.length > 0) {
            console.log(`⚡ Processed ${expiredTrades.length} expired trades`);
        }
    } catch (error) {
        console.error('Error closing expired trades:', error);
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

// Cancel an open trade (if allowed within first 30 seconds)
const cancelTrade = async (req, res) => {
    try {
        const { tradeId } = req.params;
        const { userId } = req.body;

        const [trades] = await db.query(`
            SELECT * FROM trades
            WHERE id = ? AND user_id = ? AND status = 'OPEN'
        `, [tradeId, userId]);

        if (!trades.length) {
            return res.status(404).json({ message: 'Trade not found or already closed' });
        }

        const trade = trades[0];
        const now = new Date();
        const tradeStart = new Date(trade.start_time);
        const timeDiff = (now - tradeStart) / 1000; // in seconds

        // Allow cancellation only within 30 seconds
        if (timeDiff > 30) {
            return res.status(400).json({
                message: 'Trade can only be cancelled within 30 seconds of creation',
                timeElapsed: Math.round(timeDiff)
            });
        }

        // Refund stake amount to user
        await updateUserBalance(userId, trade.stake_amount, 'add');

        // Delete the trade
        await db.query('DELETE FROM trades WHERE id = ?', [tradeId]);

        res.status(200).json({
            message: 'Trade cancelled successfully',
            refundAmount: trade.stake_amount
        });
    } catch (error) {
        console.error('Error cancelling trade:', error);
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
router.get('/trades/user/:userId', getUserTrades);
router.get('/trades/stats/:userId', getUserTradingStats);
router.get('/trades/:tradeId', getTradeById);
router.get('/balance/:userId', getUserBalance);
router.get('/assets/prices', getAssetPrices);
router.post('/trades', createTrade);
router.post('/trades/:tradeId/cancel', cancelTrade); // Changed from DELETE to POST to fix the path-to-regexp issue

// Export everything needed
export default router;
export { startTradeSettlement, stopTradeSettlement, setPriceService };