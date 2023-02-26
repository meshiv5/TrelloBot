const { default: axios } = require("axios");

async function getCardFromList(listId, apiKey, apiToken) {
  const req = await axios.get(`https://api.trello.com/1/lists/${listId}/cards?key=${apiKey}&token=${apiToken}`);
  const res = await req.data;
  return res;
}
module.exports = getCardFromList;
