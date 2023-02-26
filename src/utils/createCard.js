const { default: axios } = require("axios");

function createCard(listId, name, description, apiKey, apiToken) {
  return axios.post(`https://api.trello.com/1/cards?key=${apiKey}&token=${apiToken}&idList=${listId}&name=${name}&desc=${description}`);
}
module.exports = createCard;
