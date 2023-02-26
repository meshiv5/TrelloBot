const { default: axios } = require("axios");

async function getAllCards(boardId, apiKey, apiToken) {
  let req = await axios.get(`https://api.trello.com/1/boards/${boardId}/cards?key=${apiKey}&token=${apiToken}&fields=name,idList&list=true`);
  let cardResponse = await req.data;
  let respArr = [];
  for (let card of cardResponse) {
    let listId = card.idList;
    let re = await axios.get(`https://api.trello.com/1/lists/${listId}?key=${apiKey}&token=${apiToken}`);
    let listName = await re.data.name;
    respArr.push(`Card: <b>${card.name}</b>, List: <b>${listName}</b>`);
  }
  return respArr;
}
module.exports = getAllCards;
