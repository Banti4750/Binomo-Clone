import db from '../config/db.js';
import { Router } from "express";
import dotenv from 'dotenv';
import verifyToken from '../middleware/auth.js';
const router = Router();
dotenv.config();


const changeUsername = async (req, res) => {
    try {
        const { newUsername } = req.body;
        const userId = req.user.id; // Assuming user ID is stored in req.user

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

const updateProfile = async (req, res) => {
    try {
        const { profilePicUrl, gender, dob, name } = req.body;
        const userId = req.user.id; // Assuming user ID is stored in req.user

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

const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming user ID is stored in req.user

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
router.put('/change-username', verifyToken, changeUsername);
router.put('/update-profile', verifyToken, updateProfile);
router.get('/profile', verifyToken, getUserProfile);

export default router;