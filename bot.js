const { Telegraf, session } = require("telegraf");
const axios = require("axios");
require("dotenv").config();
const coinbaseApiKey = process.env.COINBASE_API_KEY;
const coinbaseApiUrl = process.env.COINBASE_URL;
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.telegram.setWebhook("https://dull-rose-abalone-gown.cyclic.cloud/")

bot.use(session({
  defaultSession: () => ({
    chatId: "",
    country: "",
    countryId: "",
    serviceId: "",
    service: "",
    cost: "",
    activationId: "",
    status: "",
    paymentButtonClicked: false,
    number: "",
  })
}));

// Start the bot
bot.launch().then(() => {
  console.log("Bot is up and running!");
});

const api_key = process.env.GRIZZLY_API_KEY;
const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const app = express();
app.use(express.static('public'));
const port = process.env.port || 3000;
const { major, countryCodes } = require("./utils/countryCodes");
const { majorServices, serviceCodes } = require("./utils/serviceCodes");
const url = "https://dull-rose-abalone-gown.cyclic.cloud";

async function createCoinbaseCharge(cost, chatId, countryId, serviceId) {
  try {
    // console.log("chatId", chatId);
    const response = await axios.post(
      coinbaseApiUrl,
      {
        name: "PHONESMSBOT",
        description: "Buy a number for all your needs",
        pricing_type: "fixed_price",
        local_price: {
          // amount: parseFloat(cost) * 1.4,
          amount: cost, // Set your cryptocurrency amount here
          currency: "RUB", // Set your cryptocurrency here
        },
        metadata: {
          chatId: chatId, // Capture the chat ID associated with the payment
          countryId: countryId,
          serviceId: serviceId,
        },
        redirect_url: `${url}/success`,
        cancel_url: `${url}/failure`,
      },

      {
        headers: {
          "Content-Type": "application/json",
          "X-CC-Api-Key": coinbaseApiKey,
        },
      }
    );
    console.log(response.data.data.metadata.chatId);
    return response.data.data.hosted_url;
  } catch (error) {
    console.error("Error creating Coinbase charge:", error);
    throw error;
  }
}

const allServices = async (ctx) => {
  try {
    const buttons = [];

    // Create inline keyboard buttons with three countries per row
    for (let i = 0; i < majorServices.length; i += 3) {
      const row = majorServices.slice(i, i + 3).map((service, index) => ({
        text: service,
        callback_data: `service_${i + index}`,
      }));
      buttons.push(row);
    }

    // Send the second message with the inline keyboard
    await ctx.reply("Select the service of the phone number 📞", {
      reply_markup: {
        inline_keyboard: buttons,
      },
    });
  } catch (error) {
    console.error("Error sending messages:", error);
  }
};

const getPrice = async (countryId, serviceId) => {
  const api = `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${api_key}&action=getPrices&country=${countryId}&service=${serviceId}`;
  try {
    const response = await axios.get(api);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    return { error: "Internal Server Error" };
  }
};

const getNumber = async (serviceId, countryId) => {
  const api = `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${api_key}&action=getNumber&service=${serviceId}&country=${countryId}`;
  try {
    const response = await axios.get(api);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    return { error: "Internal Server Error" };
  }
};

const getActivationStatus = async (activationId) => {
  const apiUrl = `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${api_key}&action=getStatus&id=${activationId}`;
  console.log(apiUrl);

  try {
    const response = await axios.get(apiUrl);
    let status = response.data;
    console.log(status);

    if (status.startsWith("STATUS_OK:")) {
      const activationCode = status.split(":")[1];
      return { activationCode, status };
    } else {
      // Handle other statuses or errors if needed
      return { status };
    }
  } catch (error) {
    console.error("Error getting activation status:", error);
    return null;
  }
};

bot.start(async (ctx) => {
  ctx.session.chatId = ctx.chat.id;
  try {
    // Send the first message
    await ctx.reply(`Welcome ${ctx.from.first_name} 👋`);

    if(ctx.session.number){
      expireNumber(ctx.session.activationId);
    }

    ctx.session.country = "";
    ctx.session.countryId = "";
    ctx.session.serviceId = "";
    ctx.session.service = "";
    ctx.session.cost = "";
    ctx.session.activationId = "";
    ctx.session.status = "";
    ctx.session.paymentButtonClicked = false;

    // Add a delay between messages (for example, 1 second)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Send the third message
    await ctx.reply(` Welcome to the Phone Number Service Bot! 📞📲

    This bot provides phone number services, OTP verification, and cryptocurrency payments.

    Here's how it works:

    👉 Request Phone Number: Ask the bot for a phone number for app registration.
    👉 OTP Verification: Get one-time passwords (OTPs) for your registered phone numbers.
    👉 Make Payment: Pay for phone numbers using cryptocurrency.

    To get started, simply click /guide.
    `);

    // Add another delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    const buttons = [];

    // Create inline keyboard buttons with three countries per row
    for (let i = 0; i < major.length; i += 3) {
      const row = major.slice(i, i + 3).map((country, index) => ({
        text: country,
        callback_data: `country_${i + index}`,
      }));
      buttons.push(row);
    }

    // Send the second message with the inline keyboard
    await ctx.reply("Select the country of the phone number 📞", {
      reply_markup: {
        inline_keyboard: buttons,
      },
    });
    console.log("All messages sent successfully!");
  } catch (error) {
    console.error("Error sending messages:", error);
  }
});

bot.action(/country_(\d+)/, async (ctx) => {
  const countryIndex = parseInt(ctx.match[1]);
  const selectedCountry = major[countryIndex];

  const id = countryCodes[selectedCountry];
  console.log(id);
  console.log(selectedCountry);


  ctx.session.country = selectedCountry;
  ctx.session.countryId = id;

  ctx.editMessageText(`You selected ${selectedCountry}`);
  if (id !== NaN) {
    await allServices(ctx);
  }
});

bot.action(/service_(\d+)/, async (ctx) => {
  ctx.reply(`details : ${ctx.session.country} ${ctx.session.countryId}`);
  if (ctx.session.country === "" || ctx.session.country === null || ctx.session.country === undefined) {
    await ctx.reply(
      "Please select country first. Click /start to start again."
    );
    return;
  }
  const serviceIndex = parseInt(ctx.match[1]);
  const selectedService = majorServices[serviceIndex];
  const id = serviceCodes[selectedService];
  console.log(id);
  console.log(selectedService);
  ctx.session.service = selectedService;
  ctx.session.serviceId = id;

  ctx.editMessageText(`You selected ${selectedService}`);
  ctx.reply("Please wait until we send the number details ...");
  const obj = await getPrice(ctx.session.countryId, ctx.session.serviceId);

  ctx.session.cost = obj[ctx.session.countryId.toString()][id.toString()].cost;
  await ctx.reply(`Cost is ${ctx.session.cost}₽`);

  await ctx.reply("To make a payment, click on the following button", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Make Payment", callback_data: "make_payment" }],
      ],
    },
  });
  // delete above inline keyboard after its clicked
});

bot.action("make_payment", async (ctx) => {

  ctx.editMessageText('Payment Button clicked. Keyboard removed.');
  try {
    // Check if the user sent a command to initiate a payment
    const paymentLink = await createCoinbaseCharge(ctx.session.cost, ctx.session.chatId, ctx.session.countryId, ctx.session.serviceId);

    if (paymentLink) {
      // Send the payment link to the user
      await ctx.reply(
        `To make a payment, click on the following link ${paymentLink}`
      );
    } else {
      // Handle the case where createCoinbaseCharge() did not return a valid link
      await ctx.reply("Sorry, there was an issue processing your payment.");
    }
  } catch (error) {
    console.error("Error creating payment link:", error);
    await ctx.reply("Sorry, an error occurred while processing your payment.");
  }
});

app.use(bodyParser.json());

// Define your Coinbase Commerce webhook endpoint
app.post("/coinbase-webhook", async (req, res) => {
  try {
    const eventData = req.body;
    const chatId = eventData.event.data.metadata.chatId;
    const countryId = eventData.event.data.metadata.countryId;
    const serviceId = eventData.event.data.metadata.serviceId;
    console.log(chatId);
    // Check the event type
    if (eventData.event.type === "charge:confirmed") {
      // Payment has been confirmed, handle it here

      console.log("Payment confirmed:", eventData);
      bot.telegram.sendMessage(
        chatId,
        "Your payment has been received successfully."
      );
      await bot.telegram.sendMessage(
        chatId,
        "Would you like to request your number?",
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Request Number",
                  callback_data: "request_number",
                },
              ],
            ],
          },
        }
      );
      // Implement your logic to process the payment confirmation
    } else if (eventData.event.type === "charge:failed") {
      bot.telegram.sendMessage(chatId, "Your payment has been cancelled.");
      // Payment has failed (canceled), handle it here
      await bot.telegram.sendMessage(
        chatId,
        "Would you like to request your number?",
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Request Number",
                  callback_data: "request_number",
                },
              ],
            ],
          },
        }
      );
    } else {
      // Handle other Coinbase Commerce events here
      //   console.log('Other Coinbase event:', eventData);
    }

    // Respond with a success status
    res.status(200).send("Webhook received successfully");
  } catch (error) {
    console.error("Error processing Coinbase webhook:", error);
    res.status(500).send("Internal Server Error");
  }
});


async function getOTP(serviceId, countryId, chatId, ctx) {
  if(!serviceId  || !countryId  || !chatId ){
    return
  }
  try {
    if(ctx.session.number || ctx.session.activationId){
      expireNumber(ctx.session.activationId);
    }
    let res = await getNumber(serviceId, countryId);
    let number = res.split(":")[2];
    let activationId = res.split(":")[1];
    let status_;
    ctx.session.number = number;
    ctx.session.activationId = activationId;

    console.log(377, ctx.session.number)
    // Check if activation id is null

    if (!ctx.session.activationId) {
      await getOTP(serviceId, countryId, chatId, ctx);
      return;
    }

    bot.telegram.sendMessage(chatId, `Your number is +${number}`);

    const otpInterval = setInterval(async () => {
      if(ctx.session.status.startsWith("STATUS_WAIT_CODE") || !ctx.session.status){
      let { activationCode, status } = await getActivationStatus(activationId);
      ctx.session.status = status;
      if (activationCode) {
        await bot.telegram.sendMessage(
          chatId,
          `Your OTP is: ${activationCode}`
        );
        clearInterval(otpInterval);
      }
    }
    }, 10000);

    // Set a timeout to stop checking after 1 minute
    setTimeout(async () => {
      clearInterval(otpInterval);

      if (ctx.session.status.startsWith("STATUS_WAIT_CODE")) {
        console.log("Activation status still waiting. Getting a new number...");
        await expireNumber(activationId);

        // Create an inline keyboard with a "Generate New Number" button
        await bot.telegram.sendMessage(
          chatId,
          "Would you like to request a new number?",
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Request Number Again",
                    callback_data: "request_number",
                  },
                ],
              ],
            },
          }
        );
      } else if (ctx.session.status.startsWith("STATUS_OK:")) {
        bot.telegram.sendMessage(
          chatId,
          "OTP was sent and validated successfully"
        );
      } else {
        console.log("Invalid final status:", ctx.session.status);
      }
    }, 120000);
  } catch (error) {
    console.error("Error in getOTP:", error);
  }
}


bot.action("request_number", async (ctx) => {
  ctx.editMessageText('request number clicked. Keyboard removed.');
  await getOTP(ctx.session.serviceId, ctx.session.countryId, ctx.session.chatId, ctx);
});

const expireNumber = async (activationId) => {
  const apiUrl = `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${api_key}&action=setStatus&status=8&id=${activationId}`;
  try {
    const response = await axios.get(apiUrl);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    return { error: "Internal Server Error" };
  }
};

app.get('/', (req, res) => {
  // Send a response or serve an HTML page
  res.send('Welcome to the Telegram Bot Webhook Server');
});

app.get('/coinbase-webhook', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'coinbase-webhook.html'));
});

app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'success.html'));
});

app.get('/failure', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'failure.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Start the bot
bot.launch().then(() => {
  console.log("Bot is up and running!");
});
