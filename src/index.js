require("dotenv").config();
const connectMongoose = require("./config/db.config");
const registerBotEvents = require("./utils/botEvents");

// Invocation Of connectMongoose Function To Get Connected To Database
connectMongoose();
// Invoking registerBotEvents Funtion To Register All Telegram Bot Related Events . 
registerBotEvents();
