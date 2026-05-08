import axios from 'axios';
import { load } from 'cheerio';
import puppeteer from 'puppeteer';

// Function to try getting price using Cheerio (Fast, good for static sites)
export const scrapeWithCheerio = async (url) => {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    });
    const $ = load(data);
    
    // Meta tags for better titles
    let title = $('meta[property="og:title"]').attr('content') || 
                $('meta[name="title"]').attr('content') || 
                $('title').text() || 
                'Unknown Product';

    let priceText = null;

    // Try common schema metadata (Product schema)
    const schemaScripts = $('script[type="application/ld+json"]').toArray();
    for (const script of schemaScripts) {
      try {
        const json = JSON.parse($(script).html());
        // Handle array of schemas
        const schemas = Array.isArray(json) ? json : [json];
        for (const s of schemas) {
          if (s['@type'] === 'Product' || s.offers) {
            if (s.offers?.price) {
              priceText = s.offers.price;
              break;
            }
            if (Array.isArray(s.offers) && s.offers[0]?.price) {
              priceText = s.offers[0].price;
              break;
            }
          }
        }
        if (priceText) break;
      } catch (e) {}
    }

    // Fallback to common CSS classes
    if (!priceText) {
      const priceSelectors = [
        '.a-offscreen', '.a-price-whole', '.price-amount', '.price-text', '.product-price', '.current-price',
        '[data-price]', '.price', 'meta[property="product:price:amount"]'
      ];
      for (const selector of priceSelectors) {
        let el = $(selector).first();
        if (el.length) {
          priceText = el.attr('content') || el.text();
          if (priceText && priceText.trim()) break;
        }
      }
    }

    if (priceText) {
      // Robust cleaning for international and Egyptian formats (EGP, LE, ج.م)
      let cleaned = String(priceText)
        .replace(/[^\d.,]/g, '') // Remove everything except digits, dots, and commas
        .trim();
      
      if (cleaned) {
        // Handle logic for decimal vs thousands separators
        const lastDot = cleaned.lastIndexOf('.');
        const lastComma = cleaned.lastIndexOf(',');
        
        if (lastComma > lastDot) {
          // European format: 1.000,99
          cleaned = cleaned.replace(/\./g, '').replace(',', '.');
        } else if (lastDot > lastComma) {
          // US format: 1,000.99
          cleaned = cleaned.replace(/,/g, '');
        } else {
          // Only one separator or none
          cleaned = cleaned.replace(',', '.');
        }

        const parsed = parseFloat(cleaned);
        if (!isNaN(parsed) && parsed > 0) return { name: title.trim(), price: parsed };
      }
    }
    
    return null; 
  } catch (error) {
    return null;
  }
};

// Function to use Puppeteer (Slower, but executes JS)
export const scrapeWithPuppeteer = async (url) => {
  let browser = null;
  try {
    browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    // Set user agent and headers to avoid bot detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    });
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
    
    // Better title extraction
    const title = await page.evaluate(() => {
      return document.querySelector('h1')?.innerText?.trim() || 
             document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
             document.title;
    });
    
    // Aggressive price hunting with anti-strike logic
    const scrapedData = await page.evaluate(() => {
      const findPriceByHeuristic = () => {
        const currencyRegex = /(?:EGP|LE|ج\.م|SAR|AED|\$|€|£|USD|EUR)/i;
        const pricePattern = /[\d,.]+/;
        
        const elements = Array.from(document.querySelectorAll('span, b, strong, p, div, h1, h2, h3, ins'));
        const candidates = [];

        for (const el of elements) {
          const style = window.getComputedStyle(el);
          // Ignore discounted/strike prices
          if (style.textDecoration.includes('line-through') || style.color === 'rgb(128, 128, 128)') continue;
          
          const text = el.innerText?.trim();
          if (!text || text.length > 40) continue; 

          const hasCurrency = currencyRegex.test(text);
          const hasNumber = pricePattern.test(text);

          if (hasCurrency && hasNumber) {
            const fontSize = parseFloat(style.fontSize);
            candidates.push({ text, fontSize });
          }
        }

        candidates.sort((a, b) => b.fontSize - a.fontSize);
        return candidates.length > 0 ? candidates[0].text : null;
      };

      // Priority 1: High accuracy selectors
      const selectors = [
        '.a-price .a-offscreen', '.a-price-whole', '.product-price', '.current-price', 
        '.price', '[data-price-type="finalPrice"]', '#priceblock_ourprice'
      ];
      
      for (let s of selectors) {
        const el = document.querySelector(s);
        if (el && el.innerText?.trim()) return el.innerText;
      }

      // Priority 4: Deep Search (Raw text scan)
      const deepSearch = () => {
        const bodyText = document.body.innerText;
        const priceRegex = /(?:EGP|LE|ج\.م|SAR|AED|\$|€|£|USD|EUR)\s?([\d,.]+)/i;
        const match = bodyText.match(priceRegex);
        return match ? match[0] : null;
      };

      return findPriceByHeuristic() || deepSearch();
    });

    if (scrapedData) {
      // 1. Handle Arabic Numerals (٠١٢٣٤٥٦٧٨٩)
      const arabicMap = {
        '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
        '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
      };
      let normalized = scrapedData.replace(/[٠-٩]/g, (d) => arabicMap[d]);

      // 2. Remove common Egyptian/Intl terms that might interfere
      normalized = normalized.replace(/جنيه|ج\.م|EGP|LE|SAR|AED|USD|EUR|\$|€|£/gi, '').trim();

      // 3. Clean and parse
      let cleaned = normalized.replace(/[^\d.,]/g, '').trim();
      
      if (cleaned.includes(',') && cleaned.includes('.')) {
        cleaned = cleaned.lastIndexOf('.') > cleaned.lastIndexOf(',') ? cleaned.replace(/,/g, '') : cleaned.replace(/\./g, '').replace(',', '.');
      } else if (cleaned.includes(',') && cleaned.split(',')[1]?.length === 2) {
        cleaned = cleaned.replace(',', '.');
      } else if (cleaned.includes(',')) {
        cleaned = cleaned.replace(/,/g, '');
      }
      
      const parsed = parseFloat(cleaned);
      return { name: title?.trim() || 'Product', price: !isNaN(parsed) ? parsed : null };
    }
    
    return { name: title?.trim() || 'Product', price: null };
  } catch (error) {
    return null;
  } finally {
    if (browser) await browser.close();
  }
};

export const scrapeProduct = async (url) => {
  console.log(`[Scraper] Starting scrape for: ${url}`);
  
  try {
    // First try cheerio (Fast & Reliable for meta tags)
    let data = await scrapeWithCheerio(url);
    if (data && data.price) {
      console.log(`[Scraper] Cheerio success: ${data.price} EGP`);
      return data;
    }

    console.log(`[Scraper] Cheerio failed or no price. Trying Puppeteer...`);
    
    // Fallback to puppeteer
    data = await scrapeWithPuppeteer(url);
    if (data && data.price) {
      console.log(`[Scraper] Puppeteer success: ${data.price} EGP`);
      return data;
    }

    console.log(`[Scraper] All methods failed to find a price.`);
    return data || { name: 'Product', price: null };
  } catch (err) {
    console.error(`[Scraper] Fatal error:`, err.message);
    return { name: 'Product', price: null };
  }
};
