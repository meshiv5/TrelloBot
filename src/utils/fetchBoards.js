const { default: axios } = require("axios");

async function fetchBoards(apiKey, token) {
  let req = await axios.get(`https://api.trello.com/1/members/me/boards?key=${apiKey}&token=${token}&fields=name,url`);
  const res = await req.data;
  return res;
}
module.exports = fetchBoards;
