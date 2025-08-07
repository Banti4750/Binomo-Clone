import db from '../config/db.js';
import { Router } from "express";
import dotenv from 'dotenv';
const router = Router();
dotenv.config();


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

// TODO:add middleware to protect routes
const updateProfile = async (req, res) => {
    try {
        const { profilePicUrl, gender, dob, name } = req.body;
        // const userId = req.user.id; // Assuming user ID is stored in req.user
        const userId = 5; // For testing purposes, you can replace this with req.user.id

        let updatedata = [];
        let updateValues = [];
        if (profilePicUrl) {
            updatedata.push('profile_pic_url = ?');
            updateValues.push(profilePicUrl);
        }
        if (gender) {
            updatedata.push('gender = ?');
            updateValues.push(gender);
        }
        if (dob) {
            updatedata.push('dob = ?');
            updateValues.push(dob);
        }
        if (name) {
            updatedata.push('name = ?');
            updateValues.push(name);
        }

        // Update user profile
        await db.query(
            `UPDATE users SET ${updatedata.join(', ')} WHERE id = ?`,
            [...updateValues, userId]
        );

        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// TODO:add middleware to protect routes
const getUserProfile = async (req, res) => {
    try {
        // const userId = req.user.id; // Assuming user ID is stored in req.user
        const userId = 5; // For testing purposes, you can replace this with req.user.id

        // Fetch user profile
        const [user] = await db.query('SELECT id , email , username , balance , referral_code , referrer_id , is_verified , profile_pic_url , gender , dob , name  FROM users WHERE id = ?', [userId]);
        if (user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user[0]);
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// all routes related to user profile
router.post('/change-username', changeUsername);
router.post('/update-profile', updateProfile);
router.get('/profile', getUserProfile);

export default router;