const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const api_key = process.env.GRIZZLY_API_KEY;

const { major, countryCodes } = require('./utils/countryCodes');
const { majorServices, serviceCodes } = require('./utils/serviceCodes');

let country = '';
let countryId = '';
let serviceId = '';
let service = '';


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
    await ctx.reply('Select the country of the phone number 📞', {
      reply_markup: {
        inline_keyboard: buttons,
      },
    });

    console.log('All messages sent successfully!');
  } catch (error) {
    console.error('Error sending messages:', error);
  }
});

bot.action(/country_(\d+)/, async (ctx) => {

  const countryIndex = parseInt(ctx.match[1]);
  const selectedCountry = major[countryIndex];;

  const id = countryCodes[selectedCountry];
  console.log(id);
  console.log(selectedCountry);

  // set global country and countryId
  country = selectedCountry;
  countryId = id;

  ctx.answerCbQuery(`You selected ${selectedCountry}`);

  if (id) {
    await allServices(ctx);
  }

});

bot.action(/service_(\d+)/, async (ctx) => {

  const serviceIndex = parseInt(ctx.match[1]);
  const selectedService = majorServices[serviceIndex];;

  const id = serviceCodes[selectedService];
  console.log(id);
  console.log(selectedService);

  // set global country and countryId
  service = selectedService;
  serviceId = id;

  ctx.answerCbQuery(`You selected ${selectedService}`);
  const obj = await getPrice(countryId, serviceId);
  console.log(countryId, serviceId);

  const cost = obj[countryId.toString()][serviceId.toString()].cost;
  await ctx.reply(`Cost is ${cost}₽`);
  // await ctx.reply(`$${obj[countryId.toString()][serviceId.toString()].cost}`);

});


// Handle /guide command
// bot.command('guide', (ctx) => {
//   ctx.reply('Here is the guide:');
// });

// handle buy number
// bot.command('buynumber', async (ctx) => {
//   await ctx.reply('Select the country of the phone number 📞', {
//     reply_markup: {
//       inline_keyboard: [
//         [
//           { text: 'India', callback_data: 'india' },
//           { text: 'Russia', callback_data: 'russia' },
//           { text: 'UK', callback_data: 'uk' },
//         ],
//         [
//           { text: 'USA', callback_data: 'usa' },
//           { text: 'Australia', callback_data: 'australia' },
//           { text: 'Canada', callback_data: 'canada' },
//         ],
//       ],
//     },
//   });
// });


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
    await ctx.reply('Select the service of the phone number 📞', {
      reply_markup: {
        inline_keyboard: buttons,
      },
    });

  } catch (error) {
    console.error('Error sending messages:', error);
  }
};

const getPrice = async (countryId, serviceId) => {
  const api = `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${api_key}&action=getPrices&country=${countryId}&service=${serviceId}`;
  try {
    const response = await axios.get(api);
    console.log(response.data);
    return response.data;
  }
  catch (error) {
    console.error(error);
    return { error: "Internal Server Error" };
  }
};
// Start the bot
bot.launch().then(() => {
  console.log('Bot is up and running!');
});

