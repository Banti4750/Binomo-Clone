import db from '../config/db.js';
import bcrypt from 'bcrypt';
import { Router } from "express";
const router = Router();

// Register controller
const register = async (req, res) => {
    try {
        const { email, password, referralCode } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user already exists
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        let referralBonus = 0;
        let referrerId = null;

        // If referral code is present
        if (referralCode) {
            const [referrerResult] = await db.query('SELECT id FROM users WHERE referral_code = ?', [referralCode]);

            if (referrerResult.length === 0) {
                return res.status(400).json({ message: 'Invalid referral code' });
            }

            // Referral code valid
            referralBonus = 100;
            referrerId = referrerResult[0].id;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a unique referral code (example: first 3 of email + timestamp)
        const newReferralCode = email.slice(0, 3).toUpperCase() + Date.now().toString().slice(-4);

        // Insert new user
        const [insertResult] = await db.query(
            'INSERT INTO users (email, password, username, balance, referral_code, referrer_id) VALUES (?, ?, ?, ?, ?, ?)',
            [email, hashedPassword, email.slice(0, 8), 10000 + referralBonus, newReferralCode, referrerId]
        );

        const newUserId = insertResult.insertId;

        // Optionally, insert into referrals table
        if (referrerId) {
            await db.query(
                'INSERT INTO referrals (referrer_id, referred_id, referral_code_used, bonus_given) VALUES (?, ?, ?, ?)',
                [referrerId, newUserId, referralCode, referralBonus]
            );
        }

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



// all routes related to auth
router.post('/register', register);

export default router;