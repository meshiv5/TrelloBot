require("dotenv").config();
const createBoard = require("./utils/createBoard");
const connectMongoose = require("./config/db.config");
const registerBotEvents = require("./utils/botEvents");

connectMongoose();
registerBotEvents();
