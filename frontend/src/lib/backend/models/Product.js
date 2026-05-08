const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    default: 'Unknown Product',
  },
  currentPrice: {
    type: Number,
    default: null,
  },
  previousPrice: {
    type: Number,
    default: null,
  },
  status: {
    type: String,
    enum: ['UP', 'DOWN', 'SAME', 'NEW'],
    default: 'NEW',
  },
  priceHistory: {
    type: [
      {
        price: Number,
        timestamp: { type: Date, default: Date.now }
      }
    ],
    default: []
  },
  lastCheckedAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
