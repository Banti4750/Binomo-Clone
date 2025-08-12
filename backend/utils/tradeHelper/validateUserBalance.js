import db from '../../src/config/db.js';

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

export default validateUserBalance;