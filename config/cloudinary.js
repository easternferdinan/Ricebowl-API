const cloudinary = require("cloudinary").v2
const { cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret } = require("../config/config");

cloudinary.config({
  cloud_name: cloudinaryCloudName,
  api_key: cloudinaryApiKey,
  api_secret: cloudinaryApiSecret
});

module.exports = cloudinary;