const { default: axios } = require("axios");

function createList(key, token, newName, boardID) {
  return axios.post(`https://api.trello.com/1/lists?key=${key}&token=${token}&name=${newName}&idBoard=${boardID}`);
}
module.exports = createList;
