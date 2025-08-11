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


export default updateUserBalance;