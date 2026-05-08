const TelegramBot = require('node-telegram-bot-api');
const nodemailer = require('nodemailer');

const token = process.env.TELEGRAM_BOT_TOKEN;
let bot = null;
if (token && token !== 'your_telegram_bot_token_here') {
  bot = new TelegramBot(token, { polling: false });
}

// Nodemailer setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER || 'test',
    pass: process.env.SMTP_PASS || 'test'
  }
});

const sendTelegramAlert = async (chatId, product, oldPrice, newPrice) => {
  if (!bot || !chatId) return;
  const message = `🚨 *Price changed for [${product.name}](${product.url})!*\n\n💰 ${oldPrice} → **${newPrice}**`;
  try {
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Failed to send telegram alert:', error.message);
  }
};

const sendEmailAlert = async (email, product, oldPrice, newPrice) => {
  if (!email) return;
  try {
    await transporter.sendMail({
      from: '"PriceAlert SaaS" <alerts@pricealert.example.com>',
      to: email,
      subject: `Price Alert: ${product.name}`,
      text: `The price for ${product.name} changed from $${oldPrice} to $${newPrice}. URL: ${product.url}`,
    });
  } catch (error) {
    console.error('Failed to send email alert:', error.message);
  }
};

module.exports = { sendTelegramAlert, sendEmailAlert };
