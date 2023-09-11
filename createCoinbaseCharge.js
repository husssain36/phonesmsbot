const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const coinbaseApiKey = process.env.COINBASE_API_KEY;
const coinbaseApiUrl = process.env.COINBASE_URL;
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

export default async function createCoinbaseCharge() {
    try {
      const response = await axios.post(
        coinbaseApiUrl,
        {
          name: 'Product Name',
          description: 'Product Description',
          pricing_type: 'fixed_price',
          local_price: {
            amount: 10, // Set your cryptocurrency amount here
            currency: 'RUB', // Set your cryptocurrency here
          },
          redirect_url: 'https://localhost:300/payment-success',
          cancel_url: 'https://localhost:3000/payment-cancel',
        },

        {
          headers: {
            'Content-Type': 'application/json',
            'X-CC-Api-Key': coinbaseApiKey,
          },
        }
      );
      console.log(response)
      return response.data.data.hosted_url;
    } catch (error) {
      console.error('Error creating Coinbase charge:', error);
      throw error;
    }
  }