const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    transactionType: {
        type: String,
        enum: ['Airtime Top-up', 'Internet Data', 'Bank Transfer', 'Card Deposit', 'Electricity Bill', 'Cable TV', 'Deposit to Earnings Balance'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed', 'refunded'],
        default: 'pending'
    },
    dateTime: {
        type: Date,
        default: Date.now
    },
    debited: {
        type: Boolean,
        default: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
