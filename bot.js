const { Telegraf, session } = require('telegraf');
const axios = require('axios');
require('dotenv').config();
const bot = new Telegraf(process.env['TELEGRAM_BOT_TOKEN']);
bot.use(
  session({
    defaultSession: () => ({
      chatId: '',
      country: '',
      countryId: '',
      serviceId: '',
      service: '',
      activationId: '',
      number: '',
      serviceSelection: false,
      accept: false,
    }),
  })
);

// Defining context
const context = {};
const url = process.env.DEPLOYED_URL;
const cron = require('node-cron');
const api_key = process.env['GRIZZLY_API_KEY'];
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
app.use(express.static('public'));
const port = process.env['port'] || 3000;
const { major, countryCodes } = require('./utils/countryCodes');
const { majorServices, serviceCodes } = require('./utils/serviceCodes');

app.use(bodyParser.json());


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


const getNumber = async (countryId, serviceId) => {
  const api = `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${api_key}&action=getNumber&service=${serviceId}&country=${countryId}`;
  try {
    const response = await axios.get(api);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const getActivationStatus = async (activationId) => {
  const apiUrl = `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${api_key}&action=getStatus&id=${activationId}`;
  console.log(apiUrl);

  try {
    const response = await axios.get(apiUrl);
    let status = response.data;
    console.log(status);

    if (status.startsWith('STATUS_OK:')) {
      const activationCode = status.split(':')[1];
      return { activationCode, status };
    } else {
      // Handle other statuses or errors if needed
      return { status };
    }
  } catch (error) {
    console.error('Error getting activation status:', error);
    return null;
  }
};

const getOTP = async (serviceId, countryId, chatId, activationId, number) => {
  try {
    console.log('In getOTP ', chatId);
    console.log('ServiceID ' + serviceId + ' CountryID ' + countryId);

    let status_;

    bot.telegram.sendMessage(chatId, `Your number is +${number}`);

    // Add a delay between messages (for example, 1 second)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    bot.telegram.sendMessage(
      chatId,
      "If due to some reason the number is expired or it doesn't work, Don't worry you will get the option to generate a new number in 1 min...."
    );

    const otpInterval = setInterval(async () => {
      let res = await getActivationStatus(activationId);
      console.log('In otpInterval ', chatId);
      if (res) {
        const { activationCode, status } = res;
        status_ = status;
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

      if (status_.startsWith('STATUS_WAIT_CODE')) {
        console.log('Activation status still waiting. Getting a new number...');
        await expireNumber(activationId);
        console.log('In setTimeout ', chatId);
        // Create an inline keyboard with a "Generate New Number" button
        await bot.telegram.sendMessage(
          chatId,
          'Your earlier number got deactivated. Would you like to request a new number?',
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: 'Request Number Again',
                    callback_data: 'request_number',
                  },
                  {
                    text: 'Cancle Request',
                    callback_data: 'cancle_request',
                  },
                ],
              ],
            },
          }
        );
      } else if (status_.startsWith('STATUS_OK:')) {
        context[chatId]['isActive'] = false;
        bot.telegram.sendMessage(
          chatId,
          'OTP was sent and validated successfully'
        );
        console.log('OTP was sent and validated successfully');
      } else {
        console.log('Invalid final status:', status_);
      }
    }, 60000);
  } catch (error) {
    console.error('Error in getOTP:', error);

  }
};

const expireNumber = async (activationId) => {
  const apiUrl = `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${api_key}&action=setStatus&status=8&id=${activationId}`;
  try {
    const response = await axios.get(apiUrl);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.log("In expire error");
    console.error(error);
    return { error: 'Internal Server Error' };
  }
};

bot.start(async (ctx) => {
  ctx.session.chatId = ctx.chat.id;
  console.log('In start ', ctx.session.chatId);

  try {
    if (!context[ctx.session.chatId]) {
      const obj = {
        isActive: false,
      };
      context[ctx.session.chatId] = obj;
    } else if (context[ctx.session.chatId]['isActive']) {
      await ctx.reply(
        'Please cancle the earlier request or wait for some time'
      );
      return;
    }

    // Send the first message
    await ctx.reply(`Welcome ${ctx.from.first_name} 👋`);
    ctx.session.country = '';
    ctx.session.countryId = '';
    ctx.session.serviceId = '';
    ctx.session.service = '',
      ctx.session.activationId = '';
    ctx.session.serviceSelection = false;
    ctx.session.number = '';

    // Add a delay between messages (for example, 1 second)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Send the third message
    await ctx.reply(` 🚀 Welcome To $CNXAI Virtual Numbers Bot.

✨ Revolutionize digital communication with Connexa AI's AI-Enabled Virtual Number Bot. 🤖 Streamline OTP verification and enjoy enhanced security 🔒, automated simplicity ⚙️, and personalized telephony 📱 for individuals and businesses. 💼
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
    await ctx.reply('Select the country 📞', {
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
  try {
    if (ctx.session.country && ctx.session.accept) {
      await ctx.answerCbQuery(
        `You have already selected your country as ${ctx.session.country}.`
      );
      return;
    }
    const countryIndex = parseInt(ctx.match[1]);
    const selectedCountry = major[countryIndex];

    const id = countryCodes[selectedCountry];
    console.log(id);
    console.log(selectedCountry);

    ctx.session.country = selectedCountry;
    ctx.session.countryId = id;

    ctx.answerCbQuery(`You selected ${selectedCountry}`);

    if (id !== NaN && !ctx.session.serviceSelection) {
      ctx.session.serviceSelection = true;
      await allServices(ctx);
    }
  } catch (error) {
    console.error(error);
    await ctx.reply('Some error occurred. To start again click on /start')
  }

});

bot.action(/service_(\d+)/, async (ctx) => {
  try {
    if (ctx.session.service && ctx.session.accept) {
      await ctx.answerCbQuery(
        `You have already selected your service as ${ctx.session.service}.`
      );
      return;
    }

    if (
      ctx.session.country === '' ||
      ctx.session.country === null ||
      ctx.session.country === undefined
    ) {
      await ctx.reply('Please select country first.');
      return;
    }

    const serviceIndex = parseInt(ctx.match[1]);
    const selectedService = majorServices[serviceIndex];
    const id = serviceCodes[selectedService];

    console.log(id);
    console.log(selectedService);

    ctx.session.service = selectedService;
    ctx.session.serviceId = id;

    ctx.answerCbQuery(`You selected ${selectedService}`);
    ctx.session.accept = true;

    await bot.telegram.sendMessage(
      ctx.session.chatId,
      `Do you want to continue with ${ctx.session.country} - ${ctx.session.service}`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Yes',
                callback_data: 'confirmYes',
              },
              {
                text: 'No',
                callback_data: 'confirmNo',
              },
            ],
          ],
        },
      }
    );

  } catch (error) {
    console.error(error);
    await ctx.reply('Some error occurred. To start again click on /start')
  }

});

bot.action('confirmYes', async (ctx) => {
  try {
    await ctx.reply('Please wait until we check whether the number exist for following service. ');


    const res = await getNumber(ctx.session.countryId, ctx.session.serviceId);

    //checking availability of the number
    if (res !== 'NO_NUMBERS') {
      ctx.session.number = res.split(':')[2];
      ctx.session.activationId = res.split(':')[1];
      context[ctx.session.chatId]['isActive'] = true;
      await ctx.reply('Numbers are available for requested service');
      await ctx.reply('Please wait until we send number details ... ');
      if (ctx.session.chatId) {
        await getOTP(
          ctx.session.serviceId,
          ctx.session.countryId,
          ctx.session.chatId,
          ctx.session.activationId,
          ctx.session.number);
      }
    } else {
      await ctx.reply(
        `No number available for ${ctx.session.country} - ${ctx.session.service}`
      );
      ctx.session.accept = false;
    }
    const chatId = ctx.session.chatId;
    const messageId = ctx.callbackQuery.message.message_id;
    await ctx.telegram.deleteMessage(chatId, messageId);
  } catch (error) {
    console.error(error);
    await ctx.reply('Some error occurred. To start again click on /start')
  }

});


bot.action('confirmNo', async (ctx) => {
  try {
    ctx.session.accept = false;
    const chatId = ctx.session.chatId;
    const messageId = ctx.callbackQuery.message.message_id;
    await ctx.telegram.deleteMessage(chatId, messageId);
  } catch (error) {
    console.error(error);
    await ctx.reply('Some error occurred. To start again click on /start')
  }

});


bot.action('request_number', async (ctx) => {
  try {
    const countryid = ctx.session.countryId;
    const serviceid = ctx.session.serviceId;
    console.log("In request Number Country " + countryid + " service " + serviceid)
    const res = await getNumber(countryid, serviceid);

    if (res !== 'NO_NUMBERS') {
      const number = res.split(':')[2];
      const activationId = res.split(':')[1];

      ctx.session.activationId = activationId;
      ctx.session.number = number;
      console.log("In request Number activationId " + activationId + " number " + number)
      await getOTP(
        serviceid,
        countryid,
        ctx.session.chatId,
        activationId,
        number
      );
    } else {
      await ctx.answerCbQuery('Some error occurred');
      context[chatId]['isActive'] = false;
    }
    const chatId = ctx.session.chatId;
    const messageId = ctx.callbackQuery.message.message_id;
    await ctx.telegram.deleteMessage(chatId, messageId);

  } catch (error) {
    console.error(error);
    await ctx.reply('Some error occurred. To start again click on /start')
  }

});

bot.action('cancle_request', async (ctx) => {
  try {
    await ctx.answerCbQuery('Your request was cancelled');
    const chatId = ctx.session.chatId;
    context[chatId]['isActive'] = false;
    const messageId = ctx.callbackQuery.message.message_id;
    await ctx.telegram.deleteMessage(chatId, messageId);
  } catch (error) {
    console.error(error);
    await ctx.reply('Some error occurred. To start again click on /start')
  }

});

bot.launch();

const sendRequest = async () => {
  try {
    const res = await axios.get(url);
    console.log(`CRON status: ${res.status} on ${url}`);
  } catch (error) {
    console.log(`CRON error: ${error}`);
  }
};

cron.schedule('*/5 * * * *', () => {
  sendRequest();
});

// Start the bot
bot.launch().then(() => {
  console.log('Bot is up and running!');
});

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});