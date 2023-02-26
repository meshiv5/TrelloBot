const checkAuthorized = require("../utils/checkAuthorized"); // This function return {key , token} if Authorized or False
const fetchBoards = require("../utils/fetchBoards"); // This function is used to get All Trello Board Using Trello API

const deleteBoardCommand = async (msg, bot) => {
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
};

module.exports = deleteBoardCommand;
