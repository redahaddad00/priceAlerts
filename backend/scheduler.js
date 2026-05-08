const cron = require('node-cron');
const Product = require('./models/Product');
const User = require('./models/User');
const { scrapeProduct } = require('./services/scraper');
const { sendTelegramAlert } = require('./services/alerts');

// Run every hour: '0 * * * *'
// For MVP demo, run every 5 minutes: '*/5 * * * *'
cron.schedule('*/5 * * * *', async () => {
  console.log('Running price check scheduler...');
  
  try {
    const products = await Product.find({});
    
    for (const product of products) {
      try {
        console.log(`Checking URL: ${product.url}`);
        const scrapedData = await scrapeProduct(product.url);
        
        if (scrapedData && scrapedData.price !== null) {
          const newPrice = scrapedData.price;
          
          if (!product.currentPrice) {
            // First time scrape
            product.name = scrapedData.name || product.name;
            product.currentPrice = newPrice;
            product.status = 'NEW';
            product.priceHistory.push({ price: newPrice });
            await product.save();
          } else if (newPrice !== product.currentPrice) {
            // Price changed!
            const oldPrice = product.currentPrice;
            product.previousPrice = oldPrice;
            product.currentPrice = newPrice;
            product.status = newPrice < oldPrice ? 'DOWN' : 'UP';
            product.lastCheckedAt = new Date();
            
            product.priceHistory.push({ price: newPrice });
            // Keep only last 30 entries to save space
            if (product.priceHistory.length > 30) product.priceHistory.shift();

            await product.save();

            // Fetch user to send alert
            const user = await User.findById(product.userId);
            if (user) {
              console.log(`[ALERT] Price changed for ${product.name}! ${oldPrice} -> ${newPrice}`);
              sendTelegramAlert(user.telegramChatId, product, oldPrice, newPrice);
            }
          } else {
            // Price same
            product.status = 'SAME';
            product.lastCheckedAt = new Date();
            await product.save();
          }
        }
      } catch (err) {
        console.error(`Error scraping ${product.url}:`, err.message);
      }
    }
  } catch (error) {
    console.error('Scheduler error:', error);
  }
});

console.log('Scheduler initialized.');
