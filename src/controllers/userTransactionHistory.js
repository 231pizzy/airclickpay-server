const Transaction = require('../models/transactionModel');
const { User } = require('../models/userModel');

const getUserTransactionHistory = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Retrieve the user from the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Retrieve all transactions associated with the user
        const transactions = await Transaction.find({ userId });

        return res.status(200).json(transactions);
    } catch (error) {
        console.error('Error retrieving transaction history:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getUserTransactionHistory };
