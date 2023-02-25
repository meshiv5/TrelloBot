require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const BotToken = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(BotToken, { polling: true });

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  console.log(msg.text);
  bot.sendMessage(chatId, "Received your message");
});
