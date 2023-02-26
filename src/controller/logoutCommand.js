const logout = require("../utils/logout");
const logoutCommand = async (msg, bot) => {
  try {
    // logout function delete token from database
    await logout(msg.chat.id);
    bot.sendMessage(msg.chat.id, `Logged Out Successfully ! Try Login Again /start`);
  } catch (e) {
    bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again /start");
  }
};

module.exports = logoutCommand;
