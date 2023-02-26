const { default: axios } = require("axios");

async function updateBoardName(boardId, apiKey, apiToken, newName) {
  return axios.put(`https://api.trello.com/1/boards/${boardId}?key=${apiKey}&token=${apiToken}`, { name: newName });
}
module.exports = updateBoardName;
