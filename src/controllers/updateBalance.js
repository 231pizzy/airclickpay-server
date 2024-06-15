const { User } = require('../models/userModel');
const Transaction  = require('../models/transactionModel');
const emailVerification = require('../utils/emailVerification');

const updateBalance = async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log(userId)

        // Retrieve the user from the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find all transactions for the user where status is "pending" or "success" and debited is false
        const transactions = await Transaction.find({
            userId: userId,
            status: { $in: ['pending', 'success'] },
            debited: false
        });

        // Process each transaction
        for (const transaction of transactions) {
            // Deduct amount from user's walletBalance
            user.walletBalance -= transaction.amount;

            // Calculate earnings to be added (0.1% of transaction amount)
            const earningsToAdd = 0.001 * transaction.amount;
            // Add earnings to user's earningsWallet
            user.earningsBalance += earningsToAdd;

            // Update debited field for the transaction
            transaction.debited = true;
            transaction.status = "success";

            // Save the updated user object and transaction
            await Promise.all([user.save(), transaction.save()]);

            // Send balance update email
            await emailVerification.sendBalanceUpdateEmail(user, transaction);
        }

        // Respond with success message
        res.status(200).json({ message: 'User balances updated successfully' });
    } catch (error) {
        console.error('Error updating balances:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { updateBalance };
