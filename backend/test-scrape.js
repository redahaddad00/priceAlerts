const { scrapeProduct } = require('./services/scraper');

const testUrl = process.argv[2] || 'https://www.amazon.eg/-/en/Samsung-Galaxy-S23-Ultra-5G/dp/B0BSLF8BT9';

async function test() {
  console.log(`Testing URL: ${testUrl}`);
  const data = await scrapeProduct(testUrl);
  console.log('Scraped Data:', JSON.stringify(data, null, 2));
}

test();
