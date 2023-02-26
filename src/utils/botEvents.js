const TelegramBot = require("node-telegram-bot-api");
const BotToken = process.env.TELEGRAM_BOT_TOKEN;
const checkAuthorized = require("./checkAuthorized"); // This function return {key , token} if Authorized or False
const checkValidToken = require("./checkValidToken"); // This function check if Key And Token is Valid Or Not
const createTrelloBoard = require("./createBoard"); // This function is used to create Trello Board Using Trello API
const deleteBoard = require("./deleteBoard"); // This function is used to delete Trello Board Using Trello API
const fetchBoards = require("./fetchBoards"); // This function is used to get All Trello Board Using Trello API
const logout = require("./logout"); // This function is used logout the Authorized Trello Account And Revoke The Access From Telegram Bot
const saveCredentials = require("./saveCredentials"); // This function is used To Save Token in MongoDB database
const saveDefaultBoard = require("./saveDefaultBoard"); // This function is used To Set Or Change Default Working Board
const getDefaultBoard = require("./getDefaultBoard"); // This function is used To Get Default Working Board
const getListFromBoard = require("./getListFromBoard"); // This function is used To  Get All List Available in Default Board
const createCard = require("./createCard"); // This function is used To Create Card Using Trello API
const getCardFromList = require("./getCardsFromList"); // This function is used Get All Card Inside A List Using Trello API
const moveCard = require("./moveCard"); // This function is used To Move Card From List To Another
const deleteCard = require("./deleteCard"); // This function is used To Delete a Card Using Trello API
const updateBoardName = require("./updateBoardName");
const updateCard = require("./updateCard");
const getAllCards = require("./getAllCards");
const createList = require("./createList");
const updateList = require("./updateList");
const deleteList = require("./deleteList");

// using TelegramBot Cosntructor To Create bot Object With Polling Enabled
const bot = new TelegramBot(BotToken || "", { polling: true });

function registerEvents() {
  // Code Of /help Command matching with regex
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
      bot.sendMessage(chatId, "Sorry, there was an error retrieving the list of commands.");
    }
  });

  // Code Of /start command
  bot.onText(/\/start/, async (msg) => {
    // using checkAuthorized Function With chatID to check If User is Authorized Or Not This function check Databse If Token Exist Or Not
    let isAuthorized = await checkAuthorized(msg.chat.id);
    if (isAuthorized) {
      return bot.sendMessage(msg.chat.id, "You Are Already Authorized . Proceed With Other Commands !");
    }
    // If Not Authorized Proceed With Other Steps
    bot
      .sendMessage(
        msg.chat.id,
        "Login To Trello Account Click <a href='https://trello.com/en/login'>Here</a> . Go <a href='https://trello.com/power-ups/admin/'>Here</a> Accept Agreement . Then Click <a href='https://trello.com/app-key'>Here</a> To Get Personal App Key And Reply Key With this message to proceed .",
        {
          parse_mode: "HTML",
        }
      )
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
                  // After Getting Api Key And Token Validate Them
                  await checkValidToken(appKey.text, token.text);
                  // Saving Credentials in database With ChatID For Future Usage Or To Say Persist Login
                  await saveCredentials(msg.chat.id, appKey.text, token.text);
                  bot.sendMessage(msg.chat.id, "You Are Authorized");
                } catch (e) {
                  // Catching Error's
                  bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again /start");
                }
              });
            });
        });
      });
  });

  // Code of /logout Command To logout The Trello Account From Telegram
  bot.onText(/\/logout/, async (msg) => {
    try {
      // logout function delete token from database
      await logout(msg.chat.id);
      bot.sendMessage(msg.chat.id, `Logged Out Successfully ! Try Login Again /start`);
    } catch (e) {
      bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again /start");
    }
  });

  // Code of /createboard used to create board
  bot.onText(/\/createboard/, async (msg) => {
    try {
      bot.sendMessage(msg.chat.id, `Reply With Board Name `).then((boardNameReply) => {
        bot.onReplyToMessage(msg.chat.id, boardNameReply.message_id, async (boardNameMessage) => {
          let boardName = boardNameMessage.text;
          let { key, token } = await checkAuthorized(msg.chat.id);
          // This Function Uses trello Api To Create Board
          await createTrelloBoard(boardName, key, token);
          bot.sendMessage(msg.chat.id, `Board With Name :- <b>${boardName}</b> Created Successfully`, { parse_mode: "HTML" });
        });
      });
    } catch (e) {
      bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again /start");
    }
  });

  // Code Of /showboard Command
  bot.onText(/\/showboard/, async (msg) => {
    try {
      // Using checkAuthorized Function To Check If User is Authorized And Get back Api Key And Token For Further Usage
      let { key, token } = await checkAuthorized(msg.chat.id);
      // Using Fetch Boards Function To Fetch All Boards
      let boards = await fetchBoards(key, token);
      if (boards.length == 0) {
        return bot.sendMessage(msg.chat.id, "<b>No Boards Are There Create Some Using . /createboard</b>", { parse_mode: "HTML" });
      }
      // Creating Proper Message Of List Of Boards To Respond .
      const boardNames = boards.map((board) => `<b>${board.name}</b> ${board.id}`).join("\n");
      bot.sendMessage(msg.chat.id, `These Are The Available Boards With Respective ID's\n \n` + boardNames, { parse_mode: "HTML" });
    } catch (e) {
      bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again /start");
    }
  });

  // Code For Command /deleteboard to Select a Board To Delete
  bot.onText(/\/deleteboard/, async (msg) => {
    try {
      // Using checkAuthorized Function To Check If User is Authorized And Get back Api Key And Token For Further Usage
      let { key, token } = await checkAuthorized(msg.chat.id);
      // Using Fetch Boards Function To Fetch All Boards
      let boards = await fetchBoards(key, token);
      if (boards.length == 0) {
        return bot.sendMessage(msg.chat.id, "<b>No Boards Are There Create Some Using . /createboard</b>", { parse_mode: "HTML" });
      }
      // Creating Proper Message Of List Of Boards To Respond .
      const boardNames = boards.map((board) => `<b>${board.name}</b> <a href=''>/delete_${board.id}</a>`).join("\n");
      bot.sendMessage(msg.chat.id, `Click On Command Next To Board You Want To Delete \n\n` + boardNames, { parse_mode: "HTML" });
    } catch (e) {
      bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again /start");
    }
  });

  // Code For Command /editboard to Edit Board Name
  bot.onText(/\/editboard/, async (msg) => {
    try {
      // Using checkAuthorized Function To Check If User is Authorized And Get back Api Key And Token For Further Usage
      let { key, token } = await checkAuthorized(msg.chat.id);
      // Using Fetch Boards Function To Fetch All Boards
      let boards = await fetchBoards(key, token);
      if (boards.length == 0) {
        return bot.sendMessage(msg.chat.id, "<b>No Boards Are There Create Some Using . /createboard</b>", { parse_mode: "HTML" });
      }
      // Creating Proper Message Of List Of Boards To Respond .
      const boardNames = boards.map((board) => `<b>${board.name}</b> <a href=''> ${board.id}</a>`).join("\n");
      bot.sendMessage(msg.chat.id, "Select A Board By Replying ID of Board To This Message" + "\n" + "\n" + boardNames, { parse_mode: "HTML" }).then((boardIdReply) => {
        bot.onReplyToMessage(msg.chat.id, boardIdReply.message_id, (boardIdMessage) => {
          let boardID = boardIdMessage.text;
          let selectedName;
          boards.forEach((board) => {
            if (board.id === boardID) selectedName = board.name;
          });
          bot.sendMessage(msg.chat.id, "You Have Selected A Board " + `<b>${selectedName}</b>` + ". Reply New Name To This Message to proceed .", { parse_mode: "HTML" }).then((newBoardNameReply) => {
            bot.onReplyToMessage(msg.chat.id, newBoardNameReply.message_id, async (newBoardNameMessage) => {
              let newBoardName = newBoardNameMessage.text;
              try {
                // updateBoardName Function is Used To Update Board Name
                await updateBoardName(boardID, key, token, newBoardName);
                bot.sendMessage(msg.chat.id, "Name Of Board Changed From " + `<b>${selectedName}</b>` + ` to <b>${newBoardName}</b> Successfully .`, { parse_mode: "HTML" });
              } catch (e) {
                bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again By /editboard or Start Fresh /start");
              }
            });
          });
        });
      });
    } catch (e) {
      bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again /start");
    }
  });

  // This is Code of Extended delete Command Associated With /deleteboard command This Is Main Code For Deletion Of Board While Above Was For Selection.
  bot.onText(/^\/delete_.*/, async (msg) => {
    try {
      let boardID = msg.text.split("_")[1];
      // Using checkAuthorized Function To Check If User is Authorized And Get back Api Key And Token For Further Usage
      let { key, token } = await checkAuthorized(msg.chat.id);
      // deleteBoard Function Delete Board With Given boardID
      await deleteBoard(boardID, key, token);
      bot.sendMessage(msg.chat.id, "<b>Board Deleted Successfully !</b>", { parse_mode: "HTML" });
    } catch (e) {
      bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again /deleteboard or /start");
    }
  });

  // Code Of Command /setboard which is responsible for selection of default working board where all card realted commands will be executed
  bot.onText(/\/setboard/, async (msg) => {
    try {
      let { key, token } = await checkAuthorized(msg.chat.id);
      let boards = await fetchBoards(key, token);
      if (boards.length == 0) {
        return bot.sendMessage(msg.chat.id, "<b>No Boards Are There Create Some Using . /createboard</b>", { parse_mode: "HTML" });
      }
      const boardNames = boards.map((board) => `<b>${board.name}</b> <a href=''>/set_${board.id}</a>`).join("\n");
      bot.sendMessage(msg.chat.id, `Click On Command Next To Board You Want To Set As Default Working Board . \n\n` + boardNames, { parse_mode: "HTML" });
    } catch (e) {
      bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again /start");
    }
  });

  // Code For /set_* command Which is Helper Of /setboard Command . this code is responsible for setting The Default Boards By Storing in Database.
  bot.onText(/^\/set_.*/, async (msg) => {
    try {
      let boardID = msg.text.split("_")[1];
      //  saveDeafultBoard Save The boardID in database with Key workingBoard .
      await saveDefaultBoard(msg.chat.id, boardID);
      bot.sendMessage(msg.chat.id, "<b>Default Board Set Successfully !</b>", { parse_mode: "HTML" });
    } catch (e) {
      bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again /setboard or /start");
    }
  });

  // Code For Command /newcard Used To Create New Card in Default Board
  bot.onText(/\/newcard/, async (msg) => {
    const defaultBoardId = await getDefaultBoard(msg.chat.id);
    let { key, token } = await checkAuthorized(msg.chat.id);
    if (defaultBoardId == "") {
      return bot.sendMessage(msg.chat.id, "There's No Default Board Set One Using /setboard .");
    }
    // Get Lists of List inside A Default Board
    const listIDArr = await getListFromBoard(defaultBoardId, key, token);

    const listNames = listIDArr.map((list) => `<b>${list.name}</b> <a href=''>${list.id}</a>`).join("\n");
    bot.sendMessage(msg.chat.id, "<b>To Select A List Reply With List ID</b>" + "\n" + "\n" + listNames, { parse_mode: "HTML" }).then((listIDMessageReply) => {
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
  });

  // Code For Command /movecard Used To Move card from one list to another
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
  });

  // Code For Command /editboard

  bot.onText(/\/editcard/, async (msg) => {
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
  });

  // Code For Command /deletecard Used To delete a card from default selected board
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
  });

  // Code For Command /showcard to See All Cards With list

  bot.onText(/\/showallcards/, async (msg) => {
    const defaultBoardId = await getDefaultBoard(msg.chat.id);
    let { key, token } = await checkAuthorized(msg.chat.id);
    if (defaultBoardId == "") {
      return bot.sendMessage(msg.chat.id, "There's No Default Board Set One Using /setboard .");
    }
    try {
      // respArr store array from call to getAll Cards Function Which Respond With All Cards With List They Belong to
      let respArr = await getAllCards(defaultBoardId, key, token);
      bot.sendMessage(msg.chat.id, respArr.join("\n"), { parse_mode: "HTML" });
    } catch (e) {
      bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again /showallcards or /setboard if You Have Deleted Default Board . To Start Fresh Do /start");
    }
  });

  // All Code Of Commands Related To List Like /createlist /editlist /showlist /deletelist .
  bot.onText(/\/createlist/, async (msg) => {
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
  });

  bot.onText(/\/editlist/, async (msg) => {
    let chatID = msg.chat.id;
    const defaultBoardId = await getDefaultBoard(msg.chat.id);
    let { key, token } = await checkAuthorized(msg.chat.id);
    if (defaultBoardId == "") {
      return bot.sendMessage(msg.chat.id, "There's No Default Board Set One Using /setboard .");
    }

    const listIdsArr = await getListFromBoard(defaultBoardId, key, token);
    const listNames = listIdsArr.map((list) => `<b>${list.name}</b> <a href=''>${list.id}</a>`).join("\n");
    bot
      .sendMessage(msg.chat.id, "<b>Select A List To Edit . To Select A List Reply With List ID</b>" + "\n" + "\n" + listNames, {
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
  });

  bot.onText(/\/deletelist/, async (msg) => {
    let chatID = msg.chat.id;
    const defaultBoardId = await getDefaultBoard(msg.chat.id);
    let { key, token } = await checkAuthorized(msg.chat.id);
    if (defaultBoardId == "") {
      return bot.sendMessage(msg.chat.id, "There's No Default Board Set One Using /setboard .");
    }

    const listIdsArr = await getListFromBoard(defaultBoardId, key, token);
    const listNames = listIdsArr.map((list) => `<b>${list.name}</b> <a href=''>${list.id}</a>`).join("\n");
    bot
      .sendMessage(msg.chat.id, "<b>Select A List To Edit . To Select A List Reply With List ID</b>" + "\n" + "\n" + listNames, {
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
  });

  bot.onText(/\/showlist/, async (msg) => {
    let chatID = msg.chat.id;
    const defaultBoardId = await getDefaultBoard(chatID);
    let { key, token } = await checkAuthorized(chatID);
    if (defaultBoardId == "") {
      return bot.sendMessage(chatID, "There's No Default Board Set One Using /setboard .");
    }

    const listIdsArr = await getListFromBoard(defaultBoardId, key, token);
    const listNames = listIdsArr.map((list) => `<b>${list.name}</b> <a href=''>${list.id}</a>`).join("\n");
    bot.sendMessage(chatID, "<b>All Available Lists Are .</b>" + "\n" + "\n" + listNames, {
      parse_mode: "HTML",
    });
  });
}
module.exports = registerEvents;
