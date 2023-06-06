const fs = require("fs");
const path = require("path");
const cloudinary = require("../../config/cloudinary");
const { rootPath } = require("../../config/config");

const Products = require("./productsModel");
const Categories = require("../categories/categoriesModel");
const Tags = require("../tags/tagsModel");

const index = async (req, res) => {
  const {
    skip = 0,
    limit = 0,
    search = "",
    category = "",
    tags = [],
  } = req.query;

  let criteria = {};

  try {
    if (search.length) {
      criteria = { ...criteria, name: { $regex: search, $options: "i" } };
    }

    if (category.length) {
      const categorySearch = await Categories.findOne({
        name: { $regex: category, $options: "i" },
      });
      if (categorySearch) {
        criteria = { ...criteria, category: categorySearch._id };
      }
    }

    if (tags.length) {
      const tagsSearch = await Tags.find({ name: { $in: tags } });
      if (tagsSearch.length) {
        criteria = {
          ...criteria,
          tags: { $in: tagsSearch.map((tag) => tag._id.toString()) },
        };
        console.log(criteria);
      }
    }

    if (
      (category && !criteria.category) ||
      (tags.length > 0 && criteria.tags.length < 1)
    ) {
      return res.json({
        message: "Tidak ada produk yang cocok dengan filter",
      });
    }

    const products = await Products.find(criteria)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate("category")
      .populate("tags");

    const count = await Products.countDocuments(criteria);

    return res.json({ products, count });
  } catch (error) {
    return res.status(500).json(error);
  }
};

const store = async (req, res) => {
  let payload = req.body;

  if (payload.category) {
    // Handling category field
    try {
      const category = await Categories.findOne({
        name: { $regex: payload.category, $options: "i" },
      });
      if (category) {
        payload = { ...payload, category: category._id };
      } else {
        delete payload.category;
      }
    } catch (error) {
      delete payload.category;
      return res.status(500).json(error);
    }
  }

  if (payload.tags && payload.tags.length > 0) {
    // Handling tags field
    try {
      const tags = await Tags.find({
        name: { $regex: new RegExp(payload.tags.join("|"), "i") },
      });
      if (tags.length > 0) {
        payload = { ...payload, tags: tags.map((tag) => tag._id) };
      } else {
        delete payload.tags;
      }
    } catch (error) {
      delete payload.tags;
      return res.status(500).json(error);
    }
  }

  if (req.file) {
    // Processing request with image
    const tempPath = req.file.path;
    const fileName = req.file.filename;

    // Splitting the file extension from the rest of the original name and then validating it
    // whether it's a jpg, jpeg, png, or gif.
    const fileExtension =
      req.file.originalname.split(".")[
        req.file.originalname.split(".").length - 1
      ];
    const extensionIsValid = /(jpg|jpeg|png|gif)$/i.test(fileExtension);
    if (!extensionIsValid) {
      return res.status(415).json({
        code: 415,
        error: "Unsupported Media Type",
        message:
          "Mohon gunakan format gambar yang didukung (jpg, jpeg, png, gif)",
        providedImageExtension: fileExtension,
      });
    }

    try {
      const uploadedImage = await cloudinary.uploader.upload(tempPath, {
        public_id: fileName,
        folder: "/products-images/",
      });

      const products = new Products({
        ...payload,
        image_url: uploadedImage.secure_url,
      });
      await products.save();
      return res.status(201).json(products);
    } catch (error) {
      if (error && error.name === "ValidationError") {
        return res.status(422).json({
          code: 422,
          error: "Unprocessable entity",
          message: error.message,
          detail: error.errors,
        });
      } else {
        return res.status(500).json(error);
      }
    }
  } else {
    // Processing request without image
    try {
      const products = new Products(payload);
      await products.save();
      return res.status(201).json(products);
    } catch (error) {
      if (error && error.name === "ValidationError") {
        return res.status(422).json({
          code: 422,
          error: "Unprocessable entity",
          message: error.message,
          detail: error.errors,
        });
      } else {
        return res.status(500).json(error);
      }
    }
  }
};

const update = async (req, res) => {
  let payload = req.body;

  if (payload.category) {
    // Handling category field
    try {
      const category = await Categories.findOne({
        name: { $regex: payload.category, $options: "i" },
      });
      if (category) {
        payload = { ...payload, category: category._id };
      } else {
        delete payload.category;
      }
    } catch (error) {
      delete payload.category;
      return res.status(500).json(error);
    }
  }

  if (payload.tags && payload.tags.length > 0) {
    // Handling tags field
    try {
      const tags = await Tags.find({
        name: { $regex: new RegExp(payload.tags.join("|"), "i") },
      });
      if (tags.length > 0) {
        payload = { ...payload, tags: tags.map((tag) => tag._id) };
      } else {
        delete payload.tags;
      }
    } catch (error) {
      delete payload.tags;
      return res.status(500).json(error);
    }
  }

  if (req.file) {
    // Processing request with image
    const tempPath = req.file.path;
    const fileName = req.file.filename;

    // Splitting the file extension from the rest of the original name and then validating it
    // whether it's a jpg, jpeg, png, or gif.
    const fileExtension =
      req.file.originalname.split(".")[
        req.file.originalname.split(".").length - 1
      ];
    const extensionIsValid = /(jpg|jpeg|png|gif)$/i.test(fileExtension);
    if (!extensionIsValid) {
      return res.status(415).json({
        code: 415,
        error: "Unsupported Media Type",
        message:
          "Mohon gunakan format gambar yang didukung (jpg, jpeg, png, gif)",
        providedImageExtension: fileExtension,
      });
    }

    try {
      const existingProduct = await Products.findById(req.params.id);

      if (existingProduct.image_url) {
        // Removing existing image on cloud if exist
        const imagePublicId = existingProduct.image_url.match(
          /(products-images\/[^\/.]+)/
        )[1];
        await cloudinary.uploader.destroy(imagePublicId, {
          invalidate: true,
        });
      }

      const newImage = await cloudinary.uploader.upload(tempPath, {
        public_id: fileName,
        folder: "/products-images/",
      });

      const updatedProducts = await Products.findByIdAndUpdate(
        req.params.id,
        { ...payload, image_url: newImage.secure_url },
        {
          new: true,
          runValidators: true,
        }
      );

      return res.status(201).json(updatedProducts);
    } catch (error) {
      if (error && error.name === "ValidationError") {
        return res.status(422).json({
          code: 422,
          error: "Unprocessable entity",
          message: error.message,
          detail: error.errors,
        });
      } else {
        return res.status(500).json(error);
      }
    }
  } else {
    // Processing request without image
    try {
      const products = await Products.findByIdAndUpdate(
        req.params.id,
        payload,
        {
          new: true,
          runValidators: true,
        }
      );
      return res.status(201).json(products);
    } catch (error) {
      if (error && error.name === "ValidationError") {
        return res.status(422).json({
          code: 422,
          error: "Unprocessable entity",
          message: error.message,
          detail: error.errors,
        });
      } else {
        return res.status(500).json(error);
      }
    }
  }
};

const destroy = async (req, res) => {
  try {
    const existingProduct = await Products.findByIdAndDelete(req.params.id);

    if (existingProduct.image_url) {
      // Removing existing image on cloud if exist
      const imagePublicId = existingProduct.image_url.match(
        /(products-images\/[^\/.]+)/
      )[1];
      await cloudinary.uploader.destroy(imagePublicId, {
        invalidate: true,
      });
    }

    return res.json(existingProduct);
  } catch (error) {
    return res.status(500).json(error);
  }
};

module.exports = {
  index,
  store,
  update,
  destroy,
};
