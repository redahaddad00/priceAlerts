const Product = require('../models/Product');
const { scrapeProduct } = require('../services/scraper');

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user.id });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const { url } = req.body;
    
    // Check limits based on plan
    const count = await Product.countDocuments({ userId: req.user.id });
    const { plan } = req.user;
    
    let limit = 3; // FREE
    if (plan === 'BASIC') limit = 50;
    if (plan === 'PRO') limit = Infinity;
    
    if (count >= limit) {
      return res.status(403).json({ message: `Limit reached for ${plan} plan.` });
    }

    // Check if this URL is already cached in our database
    const existingProduct = await Product.findOne({ url, currentPrice: { $ne: null } }).sort({ lastCheckedAt: -1 });

    const newProductData = {
      userId: req.user.id,
      url,
    };

    if (existingProduct) {
      newProductData.name = existingProduct.name;
      newProductData.currentPrice = existingProduct.currentPrice;
      newProductData.previousPrice = existingProduct.previousPrice;
      newProductData.status = existingProduct.status;
      newProductData.lastCheckedAt = existingProduct.lastCheckedAt;
      newProductData.priceHistory = existingProduct.priceHistory || [];
    } else {
      // Scrape instantly
      const scrapedData = await scrapeProduct(url);
      if (scrapedData && scrapedData.price !== null) {
        newProductData.name = scrapedData.name || 'Unknown Product';
        newProductData.currentPrice = scrapedData.price;
        newProductData.status = 'NEW';
        newProductData.priceHistory = [{ price: scrapedData.price }];
      }
    }

    const product = await Product.create(newProductData);

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.removeProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await product.deleteOne();
    res.status(200).json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
