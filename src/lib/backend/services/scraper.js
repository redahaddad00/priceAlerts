import axios from 'axios';
import { load } from 'cheerio';
import puppeteer from 'puppeteer';

export const scrapeWithCheerio = async (url) => {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    });
    const $ = load(data);
    let title = $('meta[property="og:title"]').attr('content') || $('meta[name="title"]').attr('content') || $('title').text() || 'Product';
    let priceText = null;
    const schemaScripts = $('script[type="application/ld+json"]').toArray();
    for (const script of schemaScripts) {
      try {
        const json = JSON.parse($(script).html());
        const schemas = Array.isArray(json) ? json : [json];
        for (const s of schemas) {
          if (s['@type'] === 'Product' || s.offers) {
            if (s.offers?.price) { priceText = s.offers.price; break; }
            if (Array.isArray(s.offers) && s.offers[0]?.price) { priceText = s.offers[0].price; break; }
          }
        }
        if (priceText) break;
      } catch (e) {}
    }
    if (!priceText) {
      const selectors = ['.a-offscreen', '.a-price-whole', '.price-amount', '.price-text', '.product-price', '.current-price', '.price'];
      for (const s of selectors) {
        let el = $(s).first();
        if (el.length) { priceText = el.attr('content') || el.text(); if (priceText?.trim()) break; }
      }
    }
    if (priceText) {
      let cleaned = String(priceText).replace(/[^\d.,]/g, '').trim();
      const lastDot = cleaned.lastIndexOf('.');
      const lastComma = cleaned.lastIndexOf(',');
      if (lastComma > lastDot) cleaned = cleaned.replace(/\./g, '').replace(',', '.');
      else if (lastDot > lastComma) cleaned = cleaned.replace(/,/g, '');
      else cleaned = cleaned.replace(',', '.');
      const parsed = parseFloat(cleaned);
      if (!isNaN(parsed)) return { name: title.trim(), price: parsed };
    }
    return null;
  } catch (error) { return null; }
};

export const scrapeWithPuppeteer = async (url) => {
  let browser = null;
  try {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    const title = await page.evaluate(() => document.querySelector('h1')?.innerText?.trim() || document.title);
    const price = await page.evaluate(() => {
      const selectors = ['.a-price .a-offscreen', '.a-price-whole', '.product-price', '.price'];
      for (let s of selectors) {
        const el = document.querySelector(s);
        if (el?.innerText?.trim()) return el.innerText;
      }
      return null;
    });
    if (price) {
      const cleaned = price.replace(/[^\d.,]/g, '').replace(',', '.');
      return { name: title, price: parseFloat(cleaned) };
    }
    return { name: title, price: null };
  } catch (e) { return null; }
  finally { if (browser) await browser.close(); }
};

export const scrapeProduct = async (url) => {
  let data = await scrapeWithCheerio(url);
  if (data && data.price) return data;
  data = await scrapeWithPuppeteer(url);
  return data || { name: 'Product', price: null };
};
