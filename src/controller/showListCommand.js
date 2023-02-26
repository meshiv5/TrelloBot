const checkAuthorized = require("../utils/checkAuthorized"); // This function return {key , token} if Authorized or False
const getDefaultBoard = require("../utils/getDefaultBoard"); // This function is used To Get Default Working Board
const getListFromBoard = require("../utils/getListFromBoard"); // This function is used To  Get All List Available in Default Board

const showListCommand = async (msg, bot) => {
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
};
module.exports = showListCommand;
