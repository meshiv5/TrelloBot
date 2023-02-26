const userModel = require("../models/user.model");
async function saveDefaultBoard(chatID, boardID) {
  await userModel.updateOne(
    { userID: chatID },
    {
      $set: {
        workingBoard: boardID,
      },
    }
  );
}
module.exports = saveDefaultBoard;
