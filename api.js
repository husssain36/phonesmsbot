const express = require("express");
const app = express();
require("dotenv").config();

const port = 8000;
const api_key = process.env.GRIZZLY_API_KEY;
const bodyParser = require('body-parser');
const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

app.get("/", (req, res) => {
  res.send("Grizzly Api");
});

app.get("/select-country", async (req, res) => {
  // utils/countryCodes.js
});

app.get("/select-service", async (req, res) => {
  //   // utils/serviceCodes.js
});

app.get("/available-numbers/:country/:service", async (req, res) => {
  let country = req.query.country;
  let service = req.query.service;
  const api = `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${api_key}&action=getNumber&service=${service}&country=${country}`;
  try {
    const response = await axios.post(api);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/get-prices/:country/:service", async (req, res) => {
  let country = req.query.country;
  let service = req.query.service;
  const api = `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${api_key}&action=getPrices&country=${country}`;
  try {
    const response = await axios.post(api);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/set-status/:id/:status/:forward", async (req, res) => {
  const { id, status, forward } = req.params;
  const url = `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${api_key}&action=setStatus&status=${status}&id=${id}&forward=${forward}`;

  try {
    const response = await axios.post(url);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/get-status/:id", async (req, res) => {
  const { id } = req.params;
  const url = `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${api_key}&action=getStatus&id=${id}`;

  try {
    const response = await axios.get(url);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/payment-success", async (req, res) => {
  try {
    const response = await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      chat_id: YOUR_CHAT_ID,
      text: 'Payment was successful!',
    });

    // Handle the response from the Telegram API if needed
    console.log(response.data);
  } catch (error) {
    console.error('Error notifying the bot:', error);
  }

  // Respond to the external service (e.g., with a success message)
  res.status(200).send('Payment success notification received.');
})

app.get("/payment-cancel", async (req, res) => {
  res.status(200).send('Payment was cancelled by the user.');
  console.log(req.body)
});
app.use(bodyParser.json());

// Define the Coinbase webhook endpoint
app.post('/coinbase-webhook', (req, res) => {
  // Verify the Coinbase webhook signature for security (optional but recommended)
  // You can use the Coinbase SDK or libraries like 'coinbase-commerce-node' for verification

  // Handle the Coinbase webhook data
  const eventData = req.body;

  // Check the payment status
  if (eventData.event.type === 'charge:confirmed') {
    // The payment has been successfully confirmed
    // You can now fetch and display the phone number or perform other actions
    console.log('Payment confirmed:', eventData.event.data);

    // Trigger your fetch API to display the phone number here
    // You can also send a notification to the user in the Telegram bot

    res.status(200).send('Payment confirmed');
  } else {
    // Handle other Coinbase events or payment failures
    console.log('Other Coinbase event:', eventData.event);

    res.status(200).send('Event processed');
  }
});

app.listen(port, () => {
  console.log(`App listening on http://localhost:${port} `);
});
