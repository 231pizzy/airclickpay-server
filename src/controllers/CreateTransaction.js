const Transaction = require('../models/transactionModel');
const { User } = require('../models/userModel');
const hashUtil = require('../utils/hashUtil');

const createTransaction = async (req, res) => {
    try {
        const { transactionType, amount, userId, paymentPin } = req.body;

        // Retrieve the user from the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if all required fields are provided
        if (!transactionType || !amount || !paymentPin) {
            return res.status(400).json({ error: 'transactionType, amount, and paymentPin are required fields' });
        }

        // Verify the payment pin
        const isMatch = await hashUtil.comparePassword(paymentPin, user.paymentPin);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid payment pin' });
        }

        // Check if user has sufficient wallet balance
        if (user.walletBalance < amount) {
            return res.status(400).json({ error: 'Insufficient wallet balance' });
        }

        // Create a new transaction instance
        const newTransaction = new Transaction({
            transactionType,
            amount,
            userId
        });

        // Save the transaction to the database
        await newTransaction.save();

        // Deduct amount from user's wallet balance
        user.walletBalance -= amount;
        await user.save();

        return res.status(201).json(newTransaction);
    } catch (error) {
        console.error('Error creating transaction:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { createTransaction };
