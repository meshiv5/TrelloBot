const checkAuthorized = require("../utils/checkAuthorized"); // This function return {key , token} if Authorized or False
const deleteBoard = require("../utils/deleteBoard"); // This function is used to delete Trello Board Using Trello API

const deleteHelperCommand = async (msg, bot) => {
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
};

module.exports = deleteHelperCommand;
