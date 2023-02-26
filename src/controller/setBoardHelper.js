const saveDefaultBoard = require("../utils/saveDefaultBoard");

const setBoardHelper = async (msg, bot) => {
  try {
    let boardID = msg.text.split("_")[1];
    //  saveDeafultBoard Save The boardID in database with Key workingBoard .
    await saveDefaultBoard(msg.chat.id, boardID);
    bot.sendMessage(msg.chat.id, "<b>Default Board Set Successfully !</b>", { parse_mode: "HTML" });
  } catch (e) {
    bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again /setboard or /start");
  }
};

module.exports = setBoardHelper;
