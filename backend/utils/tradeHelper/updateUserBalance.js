import db from '../../src/config/db.js';

// Update user balance
const updateUserBalance = async (userId, amount, operation = 'subtract') => {
    console.error('Updating user balance:', { userId, amount, operation });
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

export default updateUserBalance;