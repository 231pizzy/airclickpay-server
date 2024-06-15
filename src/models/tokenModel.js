const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const tokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'user',
  },
  token: {
    type: String,
    // required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 30 * 60 * 1000, // 1 * 60 * 1000 this is the expiry time in day(s)-- it will expire in 30 mins
  },
});

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
