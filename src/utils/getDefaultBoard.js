const userModel = require("../models/user.model");
async function getDefaultBoard(chatID) {
  let user = await userModel.findOne({ userID: chatID });
  if (!user) return false;
  return user.workingBoard;
}
module.exports = getDefaultBoard;
