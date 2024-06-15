const { User} = require('../models/userModel');

// Controller function to get current Wallet Balance and Earnings Balance
const getBalances = async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log(userId)

        // Retrieve the user from the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ 
            walletBalance: user.walletBalance,
            earningsBalance: user.earningsBalance 
        });
    } catch (error) {
        console.error('Error fetching balances:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getBalances };
