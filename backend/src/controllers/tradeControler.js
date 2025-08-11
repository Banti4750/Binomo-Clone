import db from '../config/db.js';
import { Router } from "express";
import dotenv from 'dotenv';
import validateUserBalance from '../../utils/tradeHelper/validateUserBalance.js';
import updateUserBalance from '../../utils/tradeHelper/updateUserBalance.js';

const router = Router();
dotenv.config();

// Real-time price simulation (replace with actual API in production)
const simulatePrice = (basePrice, volatility = 0.02) => {
    const change = (Math.random() - 0.5) * volatility;
    return basePrice * (1 + change);
};

// Asset prices cache
const assetPrices = {
    'EUR/USD': 1.0875,
    'GBP/USD': 1.2750,
    'USD/JPY': 149.25,
    'BTC/USD': 45000.00,
    'ETH/USD': 2800.00,
    'GOLD': 2050.00,
    'OIL': 85.50
};

// Update prices every second (in production, use WebSocket or real API)
setInterval(() => {
    Object.keys(assetPrices).forEach(asset => {
        assetPrices[asset] = simulatePrice(assetPrices[asset]);
    });
}, 1000);

// Get current asset price
const getCurrentPrice = (assetSymbol) => {
    return assetPrices[assetSymbol] || 100; // Default fallback
};

// Calculate payout percentage based on trade duration and volatility
const calculatePayoutPercentage = (duration, assetSymbol) => {
    const basePayout = 80; // 80% base payout
    const durationBonus = Math.min(duration / 60, 5); // Max 5% bonus for longer trades
    const volatilityFactor = Math.random() * 10; // Random factor for realism
    return Math.round(basePayout + durationBonus + volatilityFactor);
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

        if (stakeAmount < 1) {
            return res.status(400).json({ message: 'Minimum stake amount is $1' });
        }

        if (duration < 1 || duration > 60) {
            return res.status(400).json({ message: 'Trade duration must be between 1-60 minutes' });
        }

        // Check user balance
        const balanceCheck = await validateUserBalance(userId, stakeAmount);
        if (!balanceCheck.valid) {
            return res.status(400).json({ message: balanceCheck.message });
        }

        // Get current price and calculate trade parameters
        const entryPrice = getCurrentPrice(assetSymbol);
        const payoutPercentage = calculatePayoutPercentage(duration, assetSymbol);
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
            expiryTime
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
            const priceMovedUp = closePrice > trade.entry_price;
            const priceMovedDown = closePrice < trade.entry_price;

            if ((trade.trade_type === 'CALL' && priceMovedUp) ||
                (trade.trade_type === 'PUT' && priceMovedDown)) {
                status = 'WIN';
                const payout = (trade.stake_amount * trade.payout_percentage / 100);
                profitLoss = payout;

                // Add winnings to user balance
                await updateUserBalance(trade.user_id, trade.stake_amount + payout, 'add');
            }

            // Update trade record
            await db.query(`
                UPDATE trades
                SET status = ?, close_price = ?, profit_loss = ?, updated_at = NOW()
                WHERE id = ?
            `, [status, closePrice, profitLoss, trade.id]);
        }

        console.log(`Processed ${expiredTrades.length} expired trades`);
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
        res.status(200).json(assetPrices);
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
                AVG(CASE WHEN status IN ('WIN', 'LOSS') THEN stake_amount END) as avg_stake
            FROM trades
            WHERE user_id = ?
        `, [userId]);

        const winRate = stats[0].total_trades > 0
            ? ((stats[0].wins / (stats[0].wins + stats[0].losses)) * 100).toFixed(2)
            : 0;

        const netProfit = stats[0].total_profit - stats[0].total_loss;

        res.status(200).json({
            ...stats[0],
            win_rate: winRate,
            net_profit: netProfit
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
            return res.status(400).json({ message: 'Trade can only be cancelled within 30 seconds of creation' });
        }

        // Refund stake amount to user
        await updateUserBalance(userId, trade.stake_amount, 'add');

        // Delete the trade
        await db.query('DELETE FROM trades WHERE id = ?', [tradeId]);

        res.status(200).json({ message: 'Trade cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling trade:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Run trade settlement every minute
setInterval(closeExpiredTrades, 60000);

// ROUTES
router.get('/trades/user/:userId', getUserTrades);
router.get('/trades/:tradeId', getTradeById);
router.get('/trades/stats/:userId', getUserTradingStats);
router.post('/trades', createTrade);
router.delete('/trades/:tradeId/cancel', cancelTrade);
router.get('/assets/prices', getAssetPrices);

export default router;