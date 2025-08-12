import db from '../config/db.js';
import bcrypt from 'bcrypt';
import { Router } from "express";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import sendOtpToEmail from '../../utils/sentEmail.js';
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
            res.status(200).json({ message: 'Login successful', token: token });
        }

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


//send otp to email for forgot password
const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Check if user exists
        const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (user.length === 0) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        //rate limit check
        const [rateLimitCheck] = await db.query('SELECT * FROM otp WHERE email = ? AND created_at > NOW() - INTERVAL 5 MINUTE', [email]);

        if (rateLimitCheck.length >= process.env.OTP_LIMIT) {
            return res.status(429).json({ message: 'Too many requests. Please try again later.' });
        }

        // Generate OTP and send to email (implementation not shown)
        const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP

        // Save to DB
        await db.query(
            'INSERT INTO otp (email, otp_value, source, created_at) VALUES (?, ?, ?, NOW())',
            [email, otp, 'forgot-password']
        );

        // Send email without blocking response
        sendOtpToEmail(otp, email, user.name).catch(err => console.error('OTP Email Failed:', err));

        res.status(200).json({ message: 'OTP sent successfully', otp: otp });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

//verify otp for forgot password
const verifyOtp = async (req, res) => {
    try {
        const { email, otp, newPassword, confirmNewPassword } = req.body;

        if (!email || !otp || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: 'Email, OTP, and passwords are required' });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Check if OTP exists and is valid
        const [otpRecord] = await db.query(
            `SELECT * FROM otp
             WHERE is_used = ?
               AND email = ?
               AND otp_value = ?
               AND created_at > NOW() - INTERVAL ? MINUTE`,
            [0, email, otp, process.env.OTP_VALID_TIME]
        );

        if (!otpRecord || otpRecord.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password
        await db.query(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, email]
        );

        // Mark OTP as used
        await db.query(
            'UPDATE otp SET is_used = ? WHERE email = ? AND otp_value = ?',
            [1, email, otp]
        );

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


// all routes related to auth
router.post('/register', register);
router.post('/login', login);
router.post('/send-otp-forgot-password', sendOtp);
router.post('/verify-otp-forgot-password', verifyOtp);

export default router;