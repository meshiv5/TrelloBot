const checkAuthorized = require("../utils/checkAuthorized");
const createCard = require("../utils/createCard");
const getDefaultBoard = require("../utils/getDefaultBoard");
const getListFromBoard = require("../utils/getListFromBoard");

const newCardCommand = async (msg, bot) => {
  const defaultBoardId = await getDefaultBoard(msg.chat.id);
  let { key, token } = await checkAuthorized(msg.chat.id);
  if (defaultBoardId == "") {
    return bot.sendMessage(msg.chat.id, "There's No Default Board Set One Using /setboard .");
  }
  // Get Lists of List inside A Default Board
  const listIDArr = await getListFromBoard(defaultBoardId, key, token);

  const listNames = listIDArr.map((list) => `<b>${list.name}</b> <a href=''>${list.id}</a>`).join("\n");
  bot.sendMessage(msg.chat.id, "<b>To Select A List Reply With List ID To This Message</b>" + "\n" + "\n" + listNames, { parse_mode: "HTML" }).then((listIDMessageReply) => {
    bot.onReplyToMessage(msg.chat.id, listIDMessageReply.message_id, (listIDMessage) => {
      // listId will be selected List Where New Card is to be created
      const listID = listIDMessage.text;
      bot.sendMessage(msg.chat.id, "Reply With the name of the new card?").then((nameMsg) => {
        bot.onReplyToMessage(msg.chat.id, nameMsg.message_id, (nameReply) => {
          // name will be name of new card
          const name = nameReply.text;
          bot.sendMessage(msg.chat.id, "Reply With the description of the new card?").then(async (descMsg) => {
            bot.onReplyToMessage(msg.chat.id, descMsg.message_id, (descReply) => {
              // description of new card
              const desc = descReply.text;
              // createCard Function use trello Api to create new card
              createCard(listID, name, desc, key, token)
                .then(() => {
                  bot.sendMessage(msg.chat.id, `Card Created Successfully With Name :- <b>${name}</b>`, { parse_mode: "HTML" });
                })
                .catch((err) => {
                  bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again /newcard or /setboard if You Have Deleted Default Board . To Start Fresh Do /start");
                });
            });
          });
        });
      });
    });
  });
};

module.exports = newCardCommand;
