const userModel = require("../models/user.model");
function saveCredentials(userID, appKey, token) {
  let user = new userModel({
    userID,
    appKey,
    token,
  });
  return user.save();
}

module.exports = saveCredentials;
