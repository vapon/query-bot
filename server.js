const TelegramBot = require('node-telegram-bot-api')
    /*global process*/
    /*eslint no-undef: "error"*/
const args = process.argv.slice(2)
const KufarParser = require('./kufarParser')
    // audiotechnica, antique, 'toys and books'
const DEFAULT_TARGET_CAT_IDS = ['5020', '4030', '12090']
    // ['кассетный плеер', 'cd плеер', 'panasonic sl', 'sony d', 'sony walkman', 'аудиоплеер', 'гаи ссср', 'корпак']
const DEFAULT_QUERY_VALUES = ['panasonic sl', 'sony d']
const DEFAULT_SEARCH_URL = 'https://www.kufar.by/presearch.json'
const INTERVAL_MS = 60000

const START_COMMAND = 'kufar start'
const STOP_COMMAND = 'kufar stop'

let token = ''
if (process.env.TOKEN) {
    token = process.env.TOKEN
} else {
    /*eslint no-console: ["error", { allow: ["warn", "error"] }] */
    console.warn('setting token from args.')
    token = args[0]
}

let queryValues = DEFAULT_QUERY_VALUES
if (process.env.QUERY_VALUES) {
    queryValues = getValuesFromString(process.env.QUERY_VALUES)
} else {
    /*eslint no-console: ["error", { allow: ["warn", "error"] }] */
    console.warn('no query values were defined.')
}

let catIds = DEFAULT_TARGET_CAT_IDS
if (process.env.TARGET_CAT_IDS) {
    catIds = getValuesFromString(process.env.TARGET_CAT_IDS)
} else {
    /*eslint no-console: ["error", { allow: ["warn", "error"] }] */
    console.warn('no categories were defined. using defaults.')
}

let searchUrl = DEFAULT_SEARCH_URL
if (process.env.SEARCH_URL) {
    searchUrl = process.env.SEARCH_URL
} else {
    /*eslint no-console: ["error", { allow: ["warn", "error"] }] */
    console.warn('using default search url.')
}

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true })
let kufarSubscribers = []

if (process.env.DEFAULT_SUBSCRIBER_ID) {
    kufarSubscribers.push(process.env.DEFAULT_SUBSCRIBER_ID)
}

function getValuesFromString(param) {
    let parsed = []
    if (!param) {
        return parsed
    }
    param = param.replace(/'/g, '"')
    parsed = JSON.parse(param)
    return parsed
}

let kufarParser = new KufarParser(searchUrl, catIds, queryValues)

// Matches "/echo [whatever]. "
bot.onText(/\/echo (.+)/, (msg, match) => {
    // const subject = match[1]
    const chatId = msg.chat.id
    if (match[1] === START_COMMAND) {
        kufarSubscribers.push(chatId)
        bot.sendMessage(chatId, 'subscribed to kufar searches')
    } else if (match[1] === STOP_COMMAND) {
        kufarSubscribers = kufarSubscribers.filter(value => value !== chatId)
        bot.sendMessage(chatId, 'unsubscribed from kufar searches')
    } else {
        bot.sendMessage(chatId, 'bot is active ' + kufarSubscribers.join())
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