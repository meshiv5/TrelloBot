const checkAuthorized = require("../utils/checkAuthorized"); // This function return {key , token} if Authorized or False
const checkValidToken = require("../utils/checkValidToken");
const saveCredentials = require("../utils/saveCredentials");
const startCommand = async (msg, bot) => {
  // using checkAuthorized Function With chatID to check If User is Authorized Or Not This function check Databse If Token Exist Or Not
  let isAuthorized = await checkAuthorized(msg.chat.id);
  if (isAuthorized) {
    return bot.sendMessage(msg.chat.id, "You Are Already Authorized . Proceed With Other Commands !");
  }
  // If Not Authorized Proceed With Other Steps
  bot
    .sendMessage(
      msg.chat.id,
      "Login To Trello Account Click <a href='https://trello.com/en/login'>Here</a> . Go <a href='https://trello.com/power-ups/admin/'>Here</a> Then Accept Agreement . Then Click <a href='https://trello.com/app-key'>Here</a> To Get <b>Personal App Key</b> And Reply Key By Selecting this message to proceed .",
      {
        parse_mode: "HTML",
      }
    )
    .then((keyMessage) => {
      bot.onReplyToMessage(msg.chat.id, keyMessage.message_id, (appKey) => {
        bot
          .sendMessage(
            msg.chat.id,
            `Click <a href='https://trello.com/1/authorize?expiration=30days&name=Trello%20Integration%20Demo&key=${appKey.text}&scope=read,write&response_type=token'>Here</a> And Authorize The Application To Get Token And Reply Token By Selecting This Message To Authorize Yourself`,
            { parse_mode: "HTML" }
          )
          .then((tokenMessage) => {
            bot.onReplyToMessage(msg.chat.id, tokenMessage.message_id, async (token) => {
              try {
                // After Getting Api Key And Token Validate Them
                await checkValidToken(appKey.text, token.text);
                // Saving Credentials in database With ChatID For Future Usage Or To Say Persist Login
                await saveCredentials(msg.chat.id, appKey.text, token.text);
                bot.sendMessage(msg.chat.id, "You Are Authorized");
              } catch (e) {
                // Catching Error's
                bot.sendMessage(msg.chat.id, "Some Error Occured ! Try Again /start");
              }
            });
          });
      });
    });
};

module.exports = startCommand;
