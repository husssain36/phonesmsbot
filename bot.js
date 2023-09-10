const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// bot.command('start', (ctx) => {
//   // console.log(ctx.from);
//   bot.telegram.sendMessage(ctx.chat.id, `Welcome ${ctx.from.first_name} 👋`, {
//     reply_markup: {
//       inline_keyboard: [
//         [{ text: 'See Fruits List', callback_data: 'fruits' }],
//         [{ text: 'See Meats List', callback_data: 'meats' }],
//       ],
//     },
//   });
// });

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

    // Send the second message with the inline keyboard
    await ctx.reply('Select the country of the phone number 📞', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'India', callback_data: 'india' },
            { text: 'Russia', callback_data: 'russia' },
            { text: 'UK', callback_data: 'uk' },
          ],
          [
            { text: 'USA', callback_data: 'usa' },
            { text: 'Australia', callback_data: 'australia' },
            { text: 'Canada', callback_data: 'canada' },
          ],
        ],
      },
    });

    console.log('All messages sent successfully!');
  } catch (error) {
    console.error('Error sending messages:', error);
  }
});

bot.on('callback_query', (ctx) => {
  // Handle callback query logic here
  const data = ctx.callbackQuery.data;
  ctx.reply(`Button "${data}" was clicked.`);
});

// Handle /guide command
bot.command('guide', (ctx) => {
  ctx.reply('Here is the guide:');
});

bot.command('buynumber', async (ctx) => {
  await ctx.reply('Select the country of the phone number 📞', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'India', callback_data: 'india' },
          { text: 'Russia', callback_data: 'russia' },
          { text: 'UK', callback_data: 'uk' },
        ],
        [
          { text: 'USA', callback_data: 'usa' },
          { text: 'Australia', callback_data: 'australia' },
          { text: 'Canada', callback_data: 'canada' },
        ],
      ],
    },
  });
});

// Start the bot
bot.launch().then(() => {
  console.log('Bot is up and running!');
});
