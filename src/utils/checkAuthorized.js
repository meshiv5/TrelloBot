const userModel = require("../models/user.model");
const checkValidToken = require("./checkValidToken");
async function checkAuthorized(chatID) {
  const user = await userModel.findOne({ userID: chatID });
  if (!user) {
    return false;
  } else {
    try {
      let req = await checkValidToken(user.appKey, user.token);
      await req.data;
      return { key: user.appKey, token: user.token };
    } catch {
      return false;
    }
  }
}

module.exports = checkAuthorized;
