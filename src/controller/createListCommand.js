const checkAuthorized = require("../utils/checkAuthorized");
const createList = require("../utils/createList");
const getDefaultBoard = require("../utils/getDefaultBoard");

const createListCommand = async (msg, bot) => {
  let chatID = msg.chat.id;
  const defaultBoardId = await getDefaultBoard(msg.chat.id);
  let { key, token } = await checkAuthorized(msg.chat.id);
  if (defaultBoardId == "") {
    return bot.sendMessage(msg.chat.id, "There's No Default Board Set One Using /setboard .");
  }
  bot.sendMessage(chatID, "Reply With List Name To This Message .").then((listNameReply) => {
    bot.onReplyToMessage(chatID, listNameReply.message_id, async (listNameText) => {
      let listName = listNameText.text;
      try {
        await createList(key, token, listName, defaultBoardId);
        bot.sendMessage(chatID, "List Created Successfully With Name :- " + `<b>${listName}</b>`, { parse_mode: "HTML" });
      } catch (e) {
        bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again /createlist or /setboard if You Have Deleted Default Board . To Start Fresh Do /start");
      }
    });
  });
};
module.exports = createListCommand;
