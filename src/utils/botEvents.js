const TelegramBot = require("node-telegram-bot-api");
const BotToken = process.env.TELEGRAM_BOT_TOKEN;
const checkAuthorized = require("./checkAuthorized");
const checkValidToken = require("./checkValidToken");
const createTrelloBoard = require("./createBoard");
const deleteBoard = require("./deleteBoard");
const fetchBoards = require("./fetchBoards");
const logout = require("./logout");
const saveCredentials = require("./saveCredentials");
const saveDefaultBoard = require("./saveDefaultBoard");
const getDefaultBoard = require("./getDefaultBoard");
const getListFromBoard = require("./getListFromBoard");
const createCard = require("./createCard");
const getCardFromList = require("./getCardsFromList");
const moveCard = require("./moveCard");
const deleteCard = require("./deleteCard");

const bot = new TelegramBot(BotToken, { polling: true });

function registerEvents() {
  bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;

    try {
      const commands = await bot.getMyCommands();

      let message = "Here are some available commands:\n";

      for (let command of commands) {
        message += `/${command.command} - ${command.description}\n`;
      }

      bot.sendMessage(chatId, message);
    } catch (err) {
      console.log(err);
      bot.sendMessage(chatId, "Sorry, there was an error retrieving the list of commands.");
    }
  });

  bot.onText(/\/start/, async (msg) => {
    let isAuthorized = await checkAuthorized(msg.chat.id);
    if (isAuthorized) {
      bot.sendMessage(msg.chat.id, "You Are Already Authorized . Proceed With Other Commands !");
    } else {
      bot
        .sendMessage(msg.chat.id, "Click <a href='https://trello.com/app-key'>Here</a> To Get App Key And Reply Key With This Message", {
          parse_mode: "HTML",
        })
        .then((keyMessage) => {
          bot.onReplyToMessage(msg.chat.id, keyMessage.message_id, (appKey) => {
            bot
              .sendMessage(
                msg.chat.id,
                `Click <a href='https://trello.com/1/authorize?expiration=30days&name=Trello%20Integration%20Demo&key=${appKey.text}&scope=read,write&response_type=token'>Here</a> And Authorize The Application To Get Token And Reply Token With This Message To Authorize Yourself`,
                { parse_mode: "HTML" }
              )
              .then((tokenMessage) => {
                bot.onReplyToMessage(msg.chat.id, tokenMessage.message_id, async (token) => {
                  try {
                    await checkValidToken(appKey.text, token.text);
                    await saveCredentials(msg.chat.id, appKey.text, token.text);
                    bot.sendMessage(msg.chat.id, "You Are Authorized");
                  } catch (e) {
                    bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again /start");
                  }
                });
              });
          });
        });
    }
  });

  bot.onText(/\/logout/, async (msg) => {
    try {
      await logout(msg.chat.id);
      bot.sendMessage(msg.chat.id, `Logged Out Successfully`);
    } catch (e) {
      bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again /start");
    }
  });

  bot.onText(/\/createboard/, async (msg) => {
    try {
      bot.sendMessage(msg.chat.id, `Reply With Board Name `).then((boardNameReply) => {
        bot.onReplyToMessage(msg.chat.id, boardNameReply.message_id, async (boardNameMessage) => {
          let boardName = boardNameMessage.text;
          let { key, token } = await checkAuthorized(msg.chat.id);
          await createTrelloBoard(boardName, key, token);
          bot.sendMessage(msg.chat.id, `Board With Name :- <b>${boardName}</b> Created Successfully`, { parse_mode: "HTML" });
        });
      });
    } catch (e) {
      bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again /start");
    }
  });

  bot.onText(/\/showboard/, async (msg) => {
    try {
      let { key, token } = await checkAuthorized(msg.chat.id);
      let boards = await fetchBoards(key, token);
      if (boards.length == 0) {
        return bot.sendMessage(msg.chat.id, "<b>No Boards Are There Create Some Using . /createboard</b>", { parse_mode: "HTML" });
      }
      const boardNames = boards.map((board) => `<b>${board.name}</b> ${board.id}`).join("\n");
      bot.sendMessage(msg.chat.id, boardNames, { parse_mode: "HTML" });
    } catch (e) {
      bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again /start");
    }
  });

  bot.onText(/\/deleteboard/, async (msg) => {
    try {
      let { key, token } = await checkAuthorized(msg.chat.id);
      let boards = await fetchBoards(key, token);
      if (boards.length == 0) {
        return bot.sendMessage(msg.chat.id, "<b>No Boards Are There Create Some Using . /createboard</b>", { parse_mode: "HTML" });
      }
      const boardNames = boards.map((board) => `<b>${board.name}</b> <a href=''>/delete_${board.id}</a>`).join("\n");
      bot.sendMessage(msg.chat.id, boardNames, { parse_mode: "HTML" });
    } catch (e) {
      bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again /start");
    }
  });

  bot.onText(/^\/delete_.*/, async (msg) => {
    try {
      let boardID = msg.text.split("_")[1];
      let { key, token } = await checkAuthorized(msg.chat.id);
      await deleteBoard(boardID, key, token);
      bot.sendMessage(msg.chat.id, "<b>Board Deleted Successfully !</b>", { parse_mode: "HTML" });
    } catch (e) {
      bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again /deleteboard or /start");
    }
  });

  bot.onText(/\/setboard/, async (msg) => {
    try {
      let { key, token } = await checkAuthorized(msg.chat.id);
      let boards = await fetchBoards(key, token);
      if (boards.length == 0) {
        return bot.sendMessage(msg.chat.id, "<b>No Boards Are There Create Some Using . /createboard</b>", { parse_mode: "HTML" });
      }
      const boardNames = boards.map((board) => `<b>${board.name}</b> <a href=''>/set_${board.id}</a>`).join("\n");
      bot.sendMessage(msg.chat.id, boardNames, { parse_mode: "HTML" });
    } catch (e) {
      bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again /start");
    }
  });

  bot.onText(/^\/set_.*/, async (msg) => {
    try {
      let boardID = msg.text.split("_")[1];
      await saveDefaultBoard(msg.chat.id, boardID);
      bot.sendMessage(msg.chat.id, "<b>Default Board Set Successfully !</b>", { parse_mode: "HTML" });
    } catch (e) {
      bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again /setboard or /start");
    }
  });

  bot.onText(/\/newcard/, async (msg) => {
    const defaultBoardId = await getDefaultBoard(msg.chat.id);
    let { key, token } = await checkAuthorized(msg.chat.id);
    if (defaultBoardId == "") {
      return bot.sendMessage(msg.chat.id, "There's No Default Board Set One Using /setboard .");
    }
    const listIDArr = await getListFromBoard(defaultBoardId, key, token);

    const listNames = listIDArr.map((list) => `<b>${list.name}</b> <a href=''>${list.id}</a>`).join("\n");
    bot.sendMessage(msg.chat.id, "<b>To Select A List Reply With List ID</b>" + "\n" + "\n" + listNames, { parse_mode: "HTML" }).then((listIDMessageReply) => {
      bot.onReplyToMessage(msg.chat.id, listIDMessageReply.message_id, (listIDMessage) => {
        const listID = listIDMessage.text;
        bot.sendMessage(msg.chat.id, "Reply With the name of the new card?").then((nameMsg) => {
          bot.onReplyToMessage(msg.chat.id, nameMsg.message_id, (nameReply) => {
            const name = nameReply.text;
            bot.sendMessage(msg.chat.id, "Reply With the description of the new card?").then(async (descMsg) => {
              bot.onReplyToMessage(msg.chat.id, descMsg.message_id, (descReply) => {
                const desc = descReply.text;
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
  });

  bot.onText(/\/movecard/, async (msg) => {
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
          const fromListID = listIDMessage.text;
          bot
            .sendMessage(msg.chat.id, "<b>Select A List Where To Move Card  . To Select A List Reply With List ID</b>" + "\n" + "\n" + listNames, {
              parse_mode: "HTML",
            })
            .then((listIDMessageReply) => {
              bot.onReplyToMessage(msg.chat.id, listIDMessageReply.message_id, async (listIDMessage) => {
                const toListID = listIDMessage.text;
                let cardList = await getCardFromList(fromListID, key, token);
                const cardListNames = cardList.map((card) => `<b>${card.name}</b> <a href=''>${card.id}</a>`).join("\n");
                bot
                  .sendMessage(msg.chat.id, "<b>Select A Card To Move . To Select A Card Reply With Card ID</b>" + "\n" + "\n" + cardListNames, {
                    parse_mode: "HTML",
                  })
                  .then((cardIdReply) => {
                    bot.onReplyToMessage(msg.chat.id, cardIdReply.message_id, async (cardIdText) => {
                      try {
                        let cardID = cardIdText.text;
                        let cardName;
                        cardList.forEach((card) => {
                          if (card.id === cardID) cardName = card.name;
                        });
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
  });

  bot.onText(/\/deletecard/, async (msg) => {
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
                  let cardID = cardIdText.text;
                  let cardName;
                  cardList.forEach((card) => {
                    if (card.id === cardID) cardName = card.name;
                  });
                  await deleteCard(cardID, key, token);
                  bot.sendMessage(msg.chat.id, `Deleted Card <b>${cardName}</b> Succesfully`, { parse_mode: "HTML" });
                } catch (e) {
                  bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again /deletecard or /setboard if You Have Deleted Default Board . To Start Fresh Do /start");
                }
              });
            });
        });
      });
  });
}
module.exports = registerEvents;
