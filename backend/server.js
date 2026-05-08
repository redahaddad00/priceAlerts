require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const stripeRoutes = require('./routes/stripeRoutes');

const app = express();

// Middleware
app.use(cors());
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Webhook route must be before express.json() so it can access the raw body
app.use('/api/stripe', stripeRoutes);

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Public Scraping for Guest Mode
const { scrapeProduct } = require('./services/scraper');
app.get('/api/scrape', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ message: 'URL is required' });
    const data = await scrapeProduct(url);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Scrape failed' });
  }
});

// Database Connection
const { MongoMemoryServer } = require('mongodb-memory-server');

const startServer = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri || mongoUri.includes('127.0.0.1:27017')) {
      console.log('No external MONGODB_URI found or using default local. Starting MongoMemoryServer for reliable demo...');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT} (Listening on 0.0.0.0)`);
      require('./scheduler'); 
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

startServer();
