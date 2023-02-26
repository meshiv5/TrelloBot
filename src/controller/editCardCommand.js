const checkAuthorized = require("../utils/checkAuthorized");
const getCardFromList = require("../utils/getCardsFromList");
const getDefaultBoard = require("../utils/getDefaultBoard");
const getListFromBoard = require("../utils/getListFromBoard");
const updateCard = require("../utils/updateCard");

const editCardCommand = async (msg, bot) => {
  const defaultBoardId = await getDefaultBoard(msg.chat.id);
  let { key, token } = await checkAuthorized(msg.chat.id);
  if (defaultBoardId == "") {
    return bot.sendMessage(msg.chat.id, "There's No Default Board Set One Using /setboard .");
  }
  const listIDArr = await getListFromBoard(defaultBoardId, key, token);
  const listNames = listIDArr.map((list) => `<b>${list.name}</b> <a href=''>${list.id}</a>`).join("\n");
  bot
    .sendMessage(msg.chat.id, "<b>Select A List To Edit Card From  . To Select A List Reply With List ID</b>" + "\n" + "\n" + listNames, {
      parse_mode: "HTML",
    })
    .then((listIDMessageReply) => {
      bot.onReplyToMessage(msg.chat.id, listIDMessageReply.message_id, async (listIDMessage) => {
        // A Selected ListID from Which The Card is to Be Deleted
        const fromListID = listIDMessage.text;
        let cardList = await getCardFromList(fromListID, key, token);
        const cardListNames = cardList.map((card) => `<b>${card.name}</b> <a href=''>${card.id}</a>`).join("\n");
        bot
          .sendMessage(msg.chat.id, "<b>Select A Card To Edit . To Select A Card Reply With Card ID</b>" + "\n" + "\n" + cardListNames, {
            parse_mode: "HTML",
          })
          .then((cardIdReply) => {
            bot.onReplyToMessage(msg.chat.id, cardIdReply.message_id, async (cardIdText) => {
              let cardID = cardIdText.text;
              bot.sendMessage(msg.chat.id, "Reply New Name For Card With This Message .").then((nameMsg) => {
                bot.onReplyToMessage(msg.chat.id, nameMsg.message_id, (nameReply) => {
                  // new name of card
                  const name = nameReply.text;
                  bot.sendMessage(msg.chat.id, "Reply new description for card with this message .").then(async (descMsg) => {
                    bot.onReplyToMessage(msg.chat.id, descMsg.message_id, (descReply) => {
                      // new description of  card
                      const desc = descReply.text;
                      // updateCard Function use trello Api to update  card
                      updateCard(cardID, key, token, name, desc)
                        .then(() => {
                          bot.sendMessage(msg.chat.id, `Card Details Successfully With Name :- <b>${name}</b> And Other Details`, { parse_mode: "HTML" });
                        })
                        .catch((err) => {
                          bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again /editcard or /setboard if You Have Deleted Default Board . To Start Fresh Do /start");
                        });
                    });
                  });
                });
              });
            });
          });
      });
    });
};

module.exports = editCardCommand;
