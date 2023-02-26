const createTrelloBoard = require("../utils/createBoard"); // This function is used to create Trello Board Using Trello API
const checkAuthorized = require("../utils/checkAuthorized");
const createBoardCommand = async (msg, bot) => {
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
};
module.exports = createBoardCommand;
