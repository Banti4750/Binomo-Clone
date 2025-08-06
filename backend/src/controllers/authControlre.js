import db from '../config/db.js';
import bcrypt from 'bcrypt';
import { Router } from "express";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
const router = Router();
dotenv.config();

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
        const somerandomNumber = Math.floor(Math.random() * 1000); // Random number for uniqueness


        // Insert new user
        const [insertResult] = await db.query(
            'INSERT INTO users (email, password, username, balance, referral_code, referrer_id) VALUES (?, ?, ?, ?, ?, ?)',
            [email, hashedPassword, email.slice(0, 5) + somerandomNumber, 10000 + referralBonus, newReferralCode, referrerId]
        );

        const newUserId = insertResult.insertId;

        // Optionally, insert into referrals table
        if (referrerId) {
            await db.query(
                'INSERT INTO referrals (referrer_id, referred_id, referral_code_used, bonus_given) VALUES (?, ?, ?, ?)',
                [referrerId, newUserId, referralCode, referralBonus]
            );

            //give 100 also to user whose refferral code is used
            await db.query(
                'UPDATE users SET balance = balance + ? WHERE id = ?',
                [referralBonus, referrerId])
        }

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (!username) {
            // Check if user exists
            const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            if (user.length === 0) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Compare password
            const isMatch = await bcrypt.compare(password, user[0].password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
            // Generate JWT token
            const token = jwt.sign({ id: user[0].id }, process.env.JWT_SECRET, { expiresIn: '7d' });
            res.status(200).json({ message: 'Login successful', user: user[0], token: token });

        } else {
            // Check if user exists
            const [user] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
            if (user.length === 0) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Compare password
            const isMatch = await bcrypt.compare(password, user[0].password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Generate JWT token
            const token = jwt.sign({ id: user[0].id }, process.env.JWT_SECRET, { expiresIn: '7d' });
            res.status(200).json({ message: 'Login successful', user: user[0], token: token });
        }

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// TODO:add middleware to protect routes
const changeUsername = async (req, res) => {
    try {
        const { newUsername } = req.body;
        // const userId = req.user.id; // Assuming user ID is stored in req.user
        const userId = 5; // For testing purposes, you can replace this with req.user.id

        if (!newUsername) {
            return res.status(400).json({ message: 'New username is required' });
        }

        // Check if username already exists
        const [existingUser] = await db.query('SELECT * FROM users WHERE username = ?', [newUsername]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Update username
        await db.query('UPDATE users SET username = ? WHERE id = ?', [newUsername, userId]);

        res.status(200).json({ message: 'Username updated successfully' });
    } catch (error) {
        console.error('Change username error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}




// all routes related to auth
router.post('/register', register);
router.post('/login', login);
router.post('/change-username', changeUsername);

export default router;