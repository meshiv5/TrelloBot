const helpCommand = async (msg, bot) => {
  const chatId = msg.chat.id;
  try {
    const commands = await bot.getMyCommands();
    let message = "Here are some available commands:\n";
    for (let command of commands) {
      message += `/${command.command} - ${command.description}\n`;
    }
    bot.sendMessage(chatId, message);
  } catch (err) {
    bot.sendMessage(chatId, "Sorry, there was an error retrieving the list of commands.");
  }
};
module.exports = helpCommand;
