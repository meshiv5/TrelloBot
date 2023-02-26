const checkAuthorized = require("../utils/checkAuthorized");
const getCardFromList = require("../utils/getCardsFromList");
const getDefaultBoard = require("../utils/getDefaultBoard");
const getListFromBoard = require("../utils/getListFromBoard");
const moveCard = require("../utils/moveCard");

const moveCardCommand = async (msg, bot) => {
  const defaultBoardId = await getDefaultBoard(msg.chat.id);
  let { key, token } = await checkAuthorized(msg.chat.id);
  if (defaultBoardId == "") {
    return bot.sendMessage(msg.chat.id, "There's No Default Board Set One Using /setboard .");
  }
  const listIDArr = await getListFromBoard(defaultBoardId, key, token);
  const listNames = listIDArr.map((list) => `<b>${list.name}</b> <a href=''>${list.id}</a>`).join("\n");
  bot
    .sendMessage(msg.chat.id, "<b>Select A List To Move Card From  . To Select A List Reply With List ID</b>" + "\n" + "\n" + listNames, {
      parse_mode: "HTML",
    })
    .then((listIDMessageReply) => {
      bot.onReplyToMessage(msg.chat.id, listIDMessageReply.message_id, (listIDMessage) => {
        // A List Id From Which The Card Will Be Moved
        const fromListID = listIDMessage.text;
        bot
          .sendMessage(msg.chat.id, "<b>Select A List Where To Move Card  . To Select A List Reply With List ID</b>" + "\n" + "\n" + listNames, {
            parse_mode: "HTML",
          })
          .then((listIDMessageReply) => {
            bot.onReplyToMessage(msg.chat.id, listIDMessageReply.message_id, async (listIDMessage) => {
              //  A list ID to Be Card Will Be Moved
              const toListID = listIDMessage.text;
              let cardList = await getCardFromList(fromListID, key, token);
              // List OF Cards Available in fromListID . And Choose One From Them To Move .
              const cardListNames = cardList.map((card) => `<b>${card.name}</b> <a href=''>${card.id}</a>`).join("\n");
              bot
                .sendMessage(msg.chat.id, "<b>Select A Card To Move . To Select A Card Reply With Card ID</b>" + "\n" + "\n" + cardListNames, {
                  parse_mode: "HTML",
                })
                .then((cardIdReply) => {
                  bot.onReplyToMessage(msg.chat.id, cardIdReply.message_id, async (cardIdText) => {
                    try {
                      //  A CardID is A ID card Which will be Moved
                      let cardID = cardIdText.text;
                      let cardName;
                      cardList.forEach((card) => {
                        if (card.id === cardID) cardName = card.name;
                      });
                      //  moveCard Function uses Trello Api To Move Card to toListID In Default Position .
                      await moveCard(cardID, toListID, key, token);
                      bot.sendMessage(msg.chat.id, `Moved Card <b>${cardName}</b> Succesfully`, { parse_mode: "HTML" });
                    } catch (e) {
                      bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again /movecard or /setboard if You Have Deleted Default Board . To Start Fresh Do /start");
                    }
                  });
                });
            });
          });
      });
    });
};

module.exports = moveCardCommand;
