const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  telegramChatId: {
    type: String,
    default: null,
  },
  plan: {
    type: String,
    enum: ['FREE', 'BASIC', 'PRO'],
    default: 'FREE',
  },
  stripeCustomerId: {
    type: String,
    default: null,
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
