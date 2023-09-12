const express = require('express');
const bodyParser = require('body-parser');
const { Telegraf } = require('telegraf');
require("dotenv").config();
const app = express();
const port = 3000;
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
app.use(bodyParser.json());

// Define your Coinbase Commerce webhook endpoint
app.post('/coinbase-webhook', (req, res) => {
  try {
    const eventData = req.body;
    const chatId = eventData.event.data.metadata.chatId;
    console.log(chatId);
    // Check the event type
    if (eventData.event.type === 'charge:confirmed') {
      // Payment has been confirmed, handle it here
      console.log('Payment confirmed:', eventData);
      // Implement your logic to process the payment confirmation
    } else if (eventData.event.type === 'charge:failed') {
        // Payment has failed (canceled), handle it here
        bot.telegram.sendMessage(chatId, 'Your payment has been canceled.');
    } else {
      // Handle other Coinbase Commerce events here
    //   console.log('Other Coinbase event:', eventData);
    }

    // Respond with a success status
    res.status(200).send('Webhook received successfully');
  } catch (error) {
    console.error('Error processing Coinbase webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});