const { default: axios } = require("axios");

function createList(key, token, newName, listID) {
  return axios.put(`https://api.trello.com/1/lists/${listID}?key=${key}&token=${token}&name=${newName}`);
}
module.exports = createList;
