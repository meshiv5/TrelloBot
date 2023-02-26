const { default: axios } = require("axios");

async function moveCard(cardID, listID, apiKey, apiToken) {
  return axios.put(`https://api.trello.com/1/cards/${cardID}?idList=${listID}&key=${apiKey}&token=${apiToken}`);
}
module.exports = moveCard;
