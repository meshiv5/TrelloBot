const axios = require("axios");

function createTrelloBoard(name, appKey, token) {
  return axios.post(`https://api.trello.com/1/boards/?name=${name}&key=${appKey}&token=${token}`);
}
module.exports = createTrelloBoard;
