const fs = require("fs");
const path = require("path");
const { rootPath } = require("../../config/config");

const Products = require("./productsModel");
const Categories = require("../categories/categoriesModel");
const Tags = require("../tags/tagsModel");

const index = async (req, res) => {
  const { skip = 0, limit = 0, search = "", category = "", tags = [] } = req.query;

  let criteria = {};

  try {    
    if (search.length) {
      criteria = {...criteria, name: {$regex: search, $options: "i"}};
    }

    if (category.length) {
      const categorySearch = await Categories.findOne({name: {$regex: category, $options: "i"}});
      console.log(categorySearch);
      if (categorySearch) {
        criteria = {...criteria, category: categorySearch._id};
      }
    }
    
    if (tags.length) {
      const tagsSearch = await Tags.find({name: {$in: tags}});
      if (tagsSearch.length) {
        criteria = {...criteria, tags: tagsSearch.map(tag => tag._id)};
      }
    }

    if (search || category || tags && !criteria) {
      return res.json({
        message: "Tidak ada produk yang cocok dengan filter"
      })
    }

    const products = await Products
    .find(criteria)
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .populate("category")
    .populate("tags");

    const count = await Products.countDocuments(criteria);
    
    return res.json({products, count});
  } catch (error) {
    return res.status(500).json(error);
  }
}

const store = async (req, res) => {
  let payload = req.body

  if (payload.category) { // Handling category field 
    try {
      const category = await Categories.findOne({name: {$regex: payload.category, $options: "i"}});
      if (category) {
        payload = {...payload, category: category._id};
      } else {
        delete payload.category;
      }
    } catch (error) {
      delete payload.category;
      return res.status(500).json(error);
    }
  }

  if (payload.tags && payload.tags.length > 0) { // Handling tags field
    try {
      const tags = await Tags.find({name: {$in: payload.tags}});
      if (tags.length > 0) {
        payload = {...payload, tags: tags.map(tag => tag._id)};
      } else {
        delete payload.tags;
      }
    } catch (error) {
      delete payload.tags;
      return res.status(500).json(error);
    }
  }

  if (req.file) { // Processing request with image
    const tempPath = req.file.path;

    // Splitting the file extension from the rest of the original name and then validating it
    // whether it's a jpg, jpeg, png, or gif.
    const fileExtension = req.file.originalname.split(".")[req.file.originalname.split(".").length - 1];
    const extensionIsValid = /(jpg|jpeg|png|gif)$/i.test(fileExtension);
    if (!extensionIsValid) {
      return res.status(415).json({
        code: 415,
        error: "Unsupported Media Type",
        message: "Mohon gunakan format gambar yang didukung (jpg, jpeg, png, gif)",
        providedImageExtension: fileExtension,
      })
    }

    const fileName = req.file.filename + "." + fileExtension;
    const targetPath = path.resolve(rootPath, `public/images/products/${fileName}`);

    const src = fs.createReadStream(tempPath);
    const dest = fs.createWriteStream(targetPath);
    src.pipe(dest);

    src.on("end", async () => {
      try {
        const products = new Products({...payload, image_url: fileName});
        await products.save();
        return res.status(201).json(products);
      } catch(error) {
        fs.unlinkSync(targetPath);
        if (error && error.name === "ValidationError"){
          return res.status(422).json({
            code: 422,
            error: "Unprocessable entity",
            message: error.message,
            detail: error.errors,
          })
        } else {
          return res.status(500).json(error);
        }
      }
    });

    src.on("error", async (error) => {
      return res.status(500).json(error);
    });

  } else { // Processing request without image
    try {
      const products = new Products(payload);
      await products.save();
      return res.status(201).json(products);
    } catch (error) {
      if (error && error.name === "ValidationError"){
        return res.status(422).json({
          code: 422,
          error: "Unprocessable entity",
          message: error.message,
          detail: error.errors,
        })
      } else {
        return res.status(500).json(error);
      }
    }
  }
}

const update = async (req, res) => {
  let payload = req.body
  const id = req.params.id

  if (payload.category) { // Handling category field
    try {
      const category = await Categories.findOne({name: {$regex: payload.category, $options: "i"}});
      if (category) {
        payload = {...payload, category: category._id};
      } else {
        delete payload.category;
      }
    } catch (error) {
      delete payload.category;
      return res.status(500).json(error);
    }
  }

  if (payload.tags && payload.tags.length > 0) { // Handling tags field
    try {
      const tags = await Tags.find({name: {$in: payload.tags}});
      if (tags.length > 0) {
        payload = {...payload, tags: tags.map(tag => tag._id)};
      } else {
        delete payload.tags;
      }
    } catch (error) {
      delete payload.tags;
      return res.status(500).json(error);
    }
  }

  if (req.file) { // Processing request with image
    const tempPath = req.file.path;

    // Splitting the file extension from the rest of the original name and then validating it
    // whether it's a jpg, jpeg, png, or gif.
    const fileExtension = req.file.originalname.split(".")[req.file.originalname.split(".").length - 1];
    const extensionIsValid = /(jpg|jpeg|png|gif)$/i.test(fileExtension);
    if (!extensionIsValid) {
      return res.status(415).json({
        code: 415,
        error: "Unsupported Media Type",
        message: "Mohon gunakan format gambar yang didukung (jpg, jpeg, png, gif)",
        providedImageExtension: fileExtension,
      })
    }

    const fileName = req.file.filename + "." + fileExtension;
    const targetPath = path.resolve(rootPath, `public/images/products/${fileName}`);

    const src = fs.createReadStream(tempPath);
    const dest = fs.createWriteStream(targetPath);
    src.pipe(dest);

    src.on("end", async () => {
      try {
        let products = await Products.findById(id);

        const currentImage = `${rootPath}/public/images/products/${products.image_url}`;
        if (fs.existsSync(currentImage)) {
          fs.unlinkSync(currentImage);
        }

        products = await Products.findByIdAndUpdate(id, { ...payload, image_url: fileName}, {
          new: true,
          runValidators: true,
        });
        return res.status(201).json(products);
      } catch(error) {
        fs.unlinkSync(targetPath);
        if (error && error.name === "ValidationError"){
          return res.status(422).json({
            code: 422,
            error: "Unprocessable entity",
            message: error.message,
            detail: error.errors,
          })
        } else {
          return res.status(500).json(error);
        }
      }
    });

    src.on("error", async (error) => {
      return res.status(500).json(error);
    });

  } else { // Processing request without image
    try {
      const products = await Products.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
      });
      return res.status(201).json(products);
    } catch (error) {
      if (error && error.name === "ValidationError"){
        return res.status(422).json({
          code: 422,
          error: "Unprocessable entity",
          message: error.message,
          detail: error.errors,
        })
      } else {
        return res.status(500).json(error);
      }
    }
  }
}

const destroy = async (req, res) => {
  try {
    const products = await Products.findByIdAndDelete(req.params.id);

    const currentImage = `${rootPath}/public/images/products/${products.image_url}`;
    if (fs.existsSync(currentImage)) {
      fs.unlinkSync(currentImage);
    }

    return res.json(products);
  } catch (error) {
    return res.status(500).json(error);
  }
}

module.exports = {
  index,
  store,
  update,
  destroy,
}