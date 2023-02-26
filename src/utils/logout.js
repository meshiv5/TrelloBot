const userModel = require("../models/user.model");
async function logout(chatID) {
  try {
    let user = await userModel.findOne({ userID: chatID }).remove();
    return true;
  } catch (e) {
    return false;
  }
}
module.exports = logout;
