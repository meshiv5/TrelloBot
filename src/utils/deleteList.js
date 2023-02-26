const { default: axios } = require("axios");

function deleteList(key, token, listID) {
  return axios.put(`https://api.trello.com/1/lists/${listID}?key=${key}&token=${token}`, { closed: true });
}
module.exports = deleteList;
