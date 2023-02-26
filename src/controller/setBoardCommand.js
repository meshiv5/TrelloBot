const checkAuthorized = require("../utils/checkAuthorized");
const fetchBoards = require("../utils/fetchBoards");

const setBoardCommand = async (msg, bot) => {
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
};

module.exports = setBoardCommand;
