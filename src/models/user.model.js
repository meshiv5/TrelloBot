const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  userID: {
    type: Number,
    required: true,
    unique: true,
  },
  appKey: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    unique: true,
  },
  workingBoard: {
    type: String,
    default: "",
  },
});
const userModel = mongoose.model("user", userSchema);
module.exports = userModel;
