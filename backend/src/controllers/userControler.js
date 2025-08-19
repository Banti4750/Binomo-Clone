import db from '../config/db.js';
import { Router } from "express";
import dotenv from 'dotenv';
import verifyToken from '../middleware/auth.js';
import { upload } from '../../utils/multer.js';
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
        const { gender, dob, name } = req.body;
        const imageFile = req.file;
        const userId = req.user.id; // Assuming middleware sets req.user

        // Cloudinary gives file.path (secure URL), not file.url
        const profilePicUrl = imageFile ? imageFile.path : null;

        let updateFields = [];
        let updateValues = [];

        if (profilePicUrl) {
            updateFields.push('profile_pic_url = ?');
            updateValues.push(profilePicUrl);
        }
        if (gender) {
            updateFields.push('gender = ?');
            updateValues.push(gender);
        }
        if (dob) {
            const formattedDob = new Date(dob).toISOString().split('T')[0]; // "2025-08-05"
            updateFields.push('dob = ?');
            updateValues.push(formattedDob);
        }
        if (name) {
            updateFields.push('name = ?');
            updateValues.push(name);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: "No fields provided for update" });
        }

        // Run update query
        await db.query(
            `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
            [...updateValues, userId]
        );

        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


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

const getReferralUsers = async (req, res) => {
    const userId = req.user.id

    try {
        // Updated query to join with users table and get user names
        const [referrals] = await db.query(`
            SELECT
                r.id,
                r.referrer_id,
                r.referred_id,
                r.referral_code_used,
                r.bonus_given,
                r.created_at,
                u.name as referred_user_name,
                u.email as referred_user_email
            FROM referrals r
            LEFT JOIN users u ON r.referred_id = u.id
            WHERE r.referrer_id = ?
            ORDER BY r.created_at DESC
        `, [userId]);

        res.status(200).json({
            success: true,
            referrals,
            totalBonus: referrals.reduce((sum, ref) => sum + ref.bonus_given, 0),
            totalReferrals: referrals.length
        });
    } catch (error) {
        console.error('Get referrals error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}
// all routes related to user profile
router.put('/change-username', verifyToken, changeUsername);
router.put('/update-profile', verifyToken, upload.single("profilePic"), updateProfile);
router.get('/profile', verifyToken, getUserProfile);
router.get('/refferal', verifyToken, getReferralUsers)

export default router;