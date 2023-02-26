const { default: axios } = require("axios");

async function deleteBoard(id, APIKey, APIToken) {
  return axios.delete(`https://api.trello.com/1/boards/${id}?key=${APIKey}&token=${APIToken}`);
}
module.exports = deleteBoard;
