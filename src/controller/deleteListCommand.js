const checkAuthorized = require("../utils/checkAuthorized");
const deleteList = require("../utils/deleteList");
const getDefaultBoard = require("../utils/getDefaultBoard");
const getListFromBoard = require("../utils/getListFromBoard");

const deleteListCommand = async (msg, bot) => {
  let chatID = msg.chat.id;
  const defaultBoardId = await getDefaultBoard(msg.chat.id);
  let { key, token } = await checkAuthorized(msg.chat.id);
  if (defaultBoardId == "") {
    return bot.sendMessage(msg.chat.id, "There's No Default Board Set One Using /setboard .");
  }
  const listIdsArr = await getListFromBoard(defaultBoardId, key, token);
  const listNames = listIdsArr.map((list) => `<b>${list.name}</b> <a href=''>${list.id}</a>`).join("\n");
  bot
    .sendMessage(msg.chat.id, "<b>Select A List To Edit . To Select A List Reply List ID with this Message </b>" + "\n" + "\n" + listNames, {
      parse_mode: "HTML",
    })
    .then((listIDMessageReply) => {
      bot.onReplyToMessage(msg.chat.id, listIDMessageReply.message_id, async (listIDMessage) => {
        // A Selected ListID from Which The Card is to Be Deleted
        const selectedListId = listIDMessage.text;
        let newListName;
        listIdsArr.forEach((list) => {
          if (list.id === selectedListId) newListName = list.name;
        });
        try {
          await deleteList(key, token, selectedListId);
          bot.sendMessage(chatID, "Deleted List Successfully With Name :- " + `<b>${newListName}</b>`, { parse_mode: "HTML" });
        } catch (e) {
          console.log(e.message);
          bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again /deletelist or /setboard if You Have Deleted Default Board . To Start Fresh Do /start");
        }
      });
    });
};

module.exports = deleteListCommand;
