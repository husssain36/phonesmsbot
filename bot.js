const { Telegraf, Markup } = require("telegraf");
const axios = require("axios");
require("dotenv").config();
const coinbaseApiKey = process.env.COINBASE_API_KEY;
const coinbaseApiUrl = process.env.COINBASE_URL;
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const api_key = process.env.GRIZZLY_API_KEY;
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.port || 3000;
const { major, countryCodes } = require("./utils/countryCodes");
const { majorServices, serviceCodes } = require("./utils/serviceCodes");
const url = "https://60de-103-153-151-112.ngrok.io";
let country = "";
let countryId = "";
let serviceId = "";
let service = "";
let cost = "";
let activationId = "";
let status = "";

async function createCoinbaseCharge(cost, chatId) {
  try {
    console.log("chatId", chatId);
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
        },
        redirect_url: `${url}/coinbase-webhook`,
        cancel_url: `${url}/coinbase-webhook`,
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
    status = response.data;
    console.log(status);
    if (status.startsWith("STATUS_OK:")) {
      const activationCode = status.split(":")[1];
      return activationCode;
    } else {
      // Handle other statuses or errors if needed
      return null;
    }
  } catch (error) {
    console.error("Error getting activation status:", error);
    return null;
  }
};

bot.start(async (ctx) => {
  try {
    // Send the first message
    await ctx.reply(`Welcome ${ctx.from.first_name} 👋`);

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

  // set global country and countryId
  country = selectedCountry;
  countryId = id;

  ctx.answerCbQuery(`You selected ${selectedCountry}`);

  if (id !== NaN) {
    await allServices(ctx);
  }
});

bot.action(/service_(\d+)/, async (ctx) => {
  const serviceIndex = parseInt(ctx.match[1]);
  const selectedService = majorServices[serviceIndex];
  ctx.reply("Please wait until we send the number details ...");

  const id = serviceCodes[selectedService];
  console.log(id);
  console.log(selectedService);

  // set global country and countryId
  service = selectedService;
  serviceId = id;

  ctx.answerCbQuery(`You selected ${selectedService}`);
  const obj = await getPrice(countryId, serviceId);
  console.log(countryId, serviceId);

  cost = obj[countryId.toString()][serviceId.toString()].cost;
  await ctx.reply(`Cost is ${cost}₽`);

  await ctx.reply(
      "To make a payment, click on the following button",
      {
        reply_markup: {
          inline_keyboard: [[{ text: "Make Payment", callback_data: "make_payment" }]],
        },
      }
  );
});

bot.action("make_payment", async (ctx) => {
  const chatId = ctx.chat.id;

  try {
    // Check if the user sent a command to initiate a payment
    const paymentLink = await createCoinbaseCharge(cost, ctx.chat.id);

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
    console.log(chatId);
    // Check the event type
    if (eventData.event.type === "charge:confirmed") {
      // Payment has been confirmed, handle it here

      console.log("Payment confirmed:", eventData);
      bot.telegram.sendMessage(
        chatId,
        "Your payment has been received successfully."
      );
      bot.telegram.sendMessage(chatId, "Your generated mobile number is:");
      // Implement your logic to process the payment confirmation
    } else if (eventData.event.type === "charge:failed") {
      bot.telegram.sendMessage(chatId, "Your payment has been cancelled.");
      // Payment has failed (canceled), handle it here

      await getOTP(serviceId, countryId, chatId);

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

bot.action("request_otp", async (ctx) => {
  const chatId = ctx.chat.id;

  // Send a message indicating that OTP request is in progress
  await ctx.reply("Requesting OTP...");

  // Run the getOtp function
  const activationCode = await getActivationStatus(activationId);

  if (activationCode) {

    // await ctx.reply(`Your OTP is: ${activationCode}`);
    await bot.telegram.sendMessage(
      chatId,
      "Would you like to request an OTP again?",
      {
        reply_markup: {
          inline_keyboard: [[{ text: "Request OTP Again", callback_data: "resend_otp" }]],
        },
      }
    );
  } else {
    // Handle the case where OTP request or activation failed
    await ctx.reply(
      "OTP request failed or is still in progress, please request otp once again.."
    );
  }
});

bot.action("resend_otp", async (ctx) => {
  const chatId = ctx.chat.id;
  await ctx.reply("Requesting OTP...");

  // Run the getOtp function
  const activationCode = await getActivationStatus(activationId);





});



async function getOTP(serviceId, countryId, chatId) {
  try {
    let res = await getNumber(serviceId, countryId);
    let number = res.split(":")[2];
    let activationId = res.split(":")[1];

    // Check if activation id is null
    if (!activationId) {
      await getOTP(serviceId, countryId, chatId);
      return;
    }

    bot.telegram.sendMessage(chatId, `Your number is +${number}`);

    const otpInterval = setInterval(async () => {
      let activationCode = await getActivationStatus(activationId);
      if (activationCode) {
        await bot.telegram.sendMessage(chatId, `Your OTP is: ${activationCode}`);
        clearInterval(otpInterval);
      }
    }, 10000);

    // Set a timeout to stop checking after 1 minute
    setTimeout(async () => {
      clearInterval(otpInterval);

      if (status.startsWith("STATUS_WAIT_CODE")) {
        console.log("Activation status still waiting. Getting a new number...");
        await expireNumber(activationId);

        // Create an inline keyboard with a "Generate New Number" button
        await bot.telegram.sendMessage(
          chatId,
          "Would you like to request a new number?",
          {
            reply_markup: {
              inline_keyboard: [[{ text: "Request Number Again", callback_data: "request_number" }]],
            },
          }
        );
      } else if (status.startsWith("STATUS_OK:")) {
        bot.telegram.sendMessage(chatId, "OTP was sent and validated successfully");
      } else {
        console.log("Invalid final status:", status);
      }
    }, 120000);
  } catch (error) {
    console.error("Error in getOTP:", error);
  }
}
bot.action("request_number", async (ctx) => {
  const chatId = ctx.chat.id;

  await getOTP(serviceId, countryId, chatId);
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


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Start the bot
bot.launch().then(() => {
  console.log("Bot is up and running!");
});
