const checkAuthorized = require("../utils/checkAuthorized");
const getAllCards = require("../utils/getAllCards");
const getDefaultBoard = require("../utils/getDefaultBoard");

const showAllCardCommand = async (msg, bot) => {
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
};
module.exports = showAllCardCommand;
