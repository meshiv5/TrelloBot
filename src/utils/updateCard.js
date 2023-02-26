const { default: axios } = require("axios");

async function updateCard(cardId, apiKey, apiToken, newName, newDesc) {
  return axios.put(`https://api.trello.com/1/cards/${cardId}?key=${apiKey}&token=${apiToken}`, { name: newName, desc: newDesc });
}
module.exports = updateCard;
