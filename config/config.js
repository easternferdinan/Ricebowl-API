const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

module.exports = {
  rootPath: path.resolve(__dirname, "../"),
  serviceName: process.env.SERVICE_NAME,
  secretKey: process.env.SECRET_KEY,
  dbName: process.env.DB_NAME,
  dbURI: process.env.DB_URI,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
};
