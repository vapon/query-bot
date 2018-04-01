const TelegramBot = require('node-telegram-bot-api')
    /*global process*/
    /*eslint no-undef: "error"*/
const args = process.argv
const KufarParser = require('./kufarParser')

if (!process.env.TOKEN) {
    /*eslint no-console: ["error", { allow: ["warn", "error"] }] */
    console.warn('setting token from args.')
    process.env.TOKEN = args[2]
}

const INTERVAL_MS = 60000
const token = process.env.TOKEN
    // Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true })
let kufarSubscribers = []
let kufarParser = new KufarParser()

// Matches "/echo [whatever]. "
bot.onText(/\/echo (.+)/, (msg, match) => {
    // const subject = match[1]
    const chatId = msg.chat.id
    if (match[1] === 'kufar start') {
        kufarSubscribers.push(chatId)
        bot.sendMessage(chatId, 'subscribed to kufar searches')
    } else if (match[1] === 'kufar stop') {
        kufarSubscribers = kufarSubscribers.filter(value => value !== chatId)
        bot.sendMessage(chatId, 'unsubscribed from kufar searches')
    } else {
        bot.sendMessage(chatId, 'bot is active', kufarSubscribers.join())
    }
})

setInterval(function() {
    if (kufarSubscribers.length > 0) {
        for (var subscriber of kufarSubscribers) {
            kufarParser.searchAll((message) => {
                return bot.sendMessage(subscriber, message)
            })
        }
    }
}, INTERVAL_MS)

bot.on('polling_error', (error) => {
    /*eslint no-console: ["error", { allow: ["warn", "error"] }] */
    console.error('Polling error: ', error.code)
    if (typeof error.response !== 'undefined') {
        console.error(error.response.body)
    }
})