const checkAuthorized = require("../utils/checkAuthorized");
const deleteCard = require("../utils/deleteCard");
const getCardFromList = require("../utils/getCardsFromList");
const getDefaultBoard = require("../utils/getDefaultBoard");
const getListFromBoard = require("../utils/getListFromBoard");

const deleteCardCommand = async (msg, bot) => {
  const defaultBoardId = await getDefaultBoard(msg.chat.id);
  let { key, token } = await checkAuthorized(msg.chat.id);
  if (defaultBoardId == "") {
    return bot.sendMessage(msg.chat.id, "There's No Default Board Set One Using /setboard .");
  }
  const listIDArr = await getListFromBoard(defaultBoardId, key, token);
  const listNames = listIDArr.map((list) => `<b>${list.name}</b> <a href=''>${list.id}</a>`).join("\n");
  bot
    .sendMessage(msg.chat.id, "<b>Select A List To Delete Card From  . To Select A List Reply With List ID</b>" + "\n" + "\n" + listNames, {
      parse_mode: "HTML",
    })
    .then((listIDMessageReply) => {
      bot.onReplyToMessage(msg.chat.id, listIDMessageReply.message_id, async (listIDMessage) => {
        // A Selected ListID from Which The Card is to Be Deleted
        const fromListID = listIDMessage.text;
        let cardList = await getCardFromList(fromListID, key, token);
        const cardListNames = cardList.map((card) => `<b>${card.name}</b> <a href=''>${card.id}</a>`).join("\n");
        bot
          .sendMessage(msg.chat.id, "<b>Select A Card To Delete . To Select A Card Reply With Card ID</b>" + "\n" + "\n" + cardListNames, {
            parse_mode: "HTML",
          })
          .then((cardIdReply) => {
            bot.onReplyToMessage(msg.chat.id, cardIdReply.message_id, async (cardIdText) => {
              try {
                // CardID store the selected CardID
                let cardID = cardIdText.text;
                let cardName;
                cardList.forEach((card) => {
                  if (card.id === cardID) cardName = card.name;
                });
                // deleteCard Function uses trello Api To Delete Card With CardID
                await deleteCard(cardID, key, token);
                bot.sendMessage(msg.chat.id, `Deleted Card <b>${cardName}</b> Succesfully`, { parse_mode: "HTML" });
              } catch (e) {
                bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again /deletecard or /setboard if You Have Deleted Default Board . To Start Fresh Do /start");
              }
            });
          });
      });
    });
};
module.exports = deleteCardCommand;
