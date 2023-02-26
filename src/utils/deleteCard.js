const { default: axios } = require("axios");

async function deleteCard(cardId, apiKey, apiToken) {
  return axios.delete(`https://api.trello.com/1/cards/${cardId}?key=${apiKey}&token=${apiToken}`);
}
module.exports = deleteCard;
