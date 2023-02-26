const { default: axios } = require("axios");

function checkValidToken(appKey, token) {
  return axios.get(`https://api.trello.com/1/members/me/boards?key=${appKey}&token=${token}`);
}
module.exports = checkValidToken;
