const mongoose = require("mongoose");
let mongoURL = process.env.MONGO_DB_URL; // MongoDB uri

async function connect() {
  mongoose.set("strictQuery", false);
  return mongoose.connect(mongoURL, () => {
    console.log("Connected To Database");
  });
}

module.exports = connect;
