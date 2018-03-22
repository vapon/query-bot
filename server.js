const TelegramBot = require('node-telegram-bot-api');
const args = process.argv;

// replace the value below with the Telegram token you receive from @BotFather
if (!process.env.TOKEN) {
    console.log('setting token from args.');
    process.env.TOKEN = process.argv[2];
}

const token = process.env.TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"
    bot.sendMessage(chatId, resp);
});

// Listen for any kind of message.
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    console.log(args);
    // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, 'Received your message');
});