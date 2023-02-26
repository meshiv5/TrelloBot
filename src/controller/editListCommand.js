const checkAuthorized = require("../utils/checkAuthorized");
const getDefaultBoard = require("../utils/getDefaultBoard");
const getListFromBoard = require("../utils/getListFromBoard");
const updateList = require("../utils/updateList");

const editListCommand = async (msg, bot) => {
  let chatID = msg.chat.id;
  const defaultBoardId = await getDefaultBoard(msg.chat.id);
  let { key, token } = await checkAuthorized(msg.chat.id);
  if (defaultBoardId == "") {
    return bot.sendMessage(msg.chat.id, "There's No Default Board Set One Using /setboard .");
  }

  const listIdsArr = await getListFromBoard(defaultBoardId, key, token);
  const listNames = listIdsArr.map((list) => `<b>${list.name}</b> <a href=''>${list.id}</a>`).join("\n");
  bot
    .sendMessage(msg.chat.id, "<b>Select A List To Edit . To Select A List Reply ListID with This Message</b>" + "\n" + "\n" + listNames, {
      parse_mode: "HTML",
    })
    .then((listIDMessageReply) => {
      bot.onReplyToMessage(msg.chat.id, listIDMessageReply.message_id, async (listIDMessage) => {
        // A Selected ListID from Which The Card is to Be Deleted
        const selectedListId = listIDMessage.text;
        bot.sendMessage(chatID, "Reply With New Name For List To This Message .").then((listNameReply) => {
          bot.onReplyToMessage(chatID, listNameReply.message_id, async (listNameText) => {
            let newListName = listNameText.text;
            try {
              await updateList(key, token, newListName, selectedListId);
              bot.sendMessage(chatID, "List Updated Successfully With New Name :- " + `<b>${newListName}</b>`, { parse_mode: "HTML" });
            } catch (e) {
              console.log(e.message);
              bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again /editlist or /setboard if You Have Deleted Default Board . To Start Fresh Do /start");
            }
          });
        });
      });
    });
};

module.exports = editListCommand;
