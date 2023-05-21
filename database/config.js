const mongoose = require("mongoose");
const { dbURI } = require("../config/config");

(async () => {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(dbURI);
  } catch (error) {
    console.log(`Connection error.\n ${error}`);
  }
})();

const db = mongoose.connection;

module.exports = db;
