const { default: axios } = require("axios");

async function getListFromBoard(boardID, apiKey, token) {
  let req = await axios.get(`https://api.trello.com/1/boards/${boardID}/lists?key=${apiKey}&token=${token}`);
  let res = await req.data;
  return res;
}
module.exports = getListFromBoard;
