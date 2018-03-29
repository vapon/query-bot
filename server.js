const TelegramBot = require('node-telegram-bot-api');
const args = process.argv;
const KufarParser = require('./kufarParser');

if (!process.env.TOKEN) {
    console.log('setting token from args.');
    process.env.TOKEN = process.argv[2]
}

const INTERVAL_MS = 300000;
const token = process.env.TOKEN;
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });
let kufarSubscribers = [];
let kufarParser = new KufarParser();

// Matches "/echo [whatever]. "
bot.onText(/\/echo (.+)/, (msg, match) => {
    const subject = match[1];
    const chatId = msg.chat.id
    if (match[1] === 'kufar start') {
        kufarSubscribers.push(chatId)
        bot.sendMessage(chatId, 'subscribed to kufar searches');
    } else if (match[1] === 'kufar stop') {
        kufarSubscribers = kufarSubscribers.filter(value => value !== chatId);
        bot.sendMessage(chatId, 'unsubscribed from kufar searches');
    } else {
        bot.sendMessage(chatId, 'bot is active');
    }
})

// Listen for any message.
// bot.on('message', (msg) => {
//     const chatId = msg.chat.id
//     console.log(args)
//     // send a message to the chat acknowledging receipt of their message
//     bot.sendMessage(chatId, 'Received your message')
// })

setInterval(function() {
    if (kufarSubscribers.length > 0) {
        for (subscriber of kufarSubscribers) {
            kufarParser.searchAll((message) => {
                return bot.sendMessage(subscriber, message)
            })
        }
    }
}, INTERVAL_MS);

bot.on('polling_error', (error) => {
    console.log('Polling error: ', error.code)
    if (typeof error.response !== 'undefined') {
        console.log(error.response.body)
    }
});
