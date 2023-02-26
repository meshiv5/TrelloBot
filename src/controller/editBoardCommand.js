const checkAuthorized = require("../utils/checkAuthorized"); // This function return {key , token} if Authorized or False
const fetchBoards = require("../utils/fetchBoards"); // This function is used to get All Trello Board Using Trello API
const updateBoardName = require("../utils/updateBoardName"); // This Function is used to updateBoardName

const editBoardCommand = async (msg, bot) => {
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
    bot.sendMessage(msg.chat.id, "Select A Board By Replying ID of Board With This Message" + "\n" + "\n" + boardNames, { parse_mode: "HTML" }).then((boardIdReply) => {
      bot.onReplyToMessage(msg.chat.id, boardIdReply.message_id, (boardIdMessage) => {
        let boardID = boardIdMessage.text;
        let selectedName;
        boards.forEach((board) => {
          if (board.id === boardID) selectedName = board.name;
        });
        bot.sendMessage(msg.chat.id, "You Have Selected A Board " + `<b>${selectedName}</b>` + ". Reply New Name With This Message to proceed .", { parse_mode: "HTML" }).then((newBoardNameReply) => {
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
};

module.exports = editBoardCommand;
