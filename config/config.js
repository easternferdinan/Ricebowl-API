const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

module.exports = {
  rootPath: path.resolve(__dirname, "../"),
  serviceName: process.env.SERVICE_NAME,
  secretKey: process.env.SECRET_KEY,
  dbName: process.env.DB_NAME,
  dbURI: process.env.DB_URI,
};
