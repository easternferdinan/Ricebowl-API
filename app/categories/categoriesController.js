const Categories = require("./categoriesModel");

const index = async (req, res) => {
  try {
    const categories = await Categories.find();
    return res.json(categories);
  } catch (error) {
    return res.status(500).json(error);
  }
}

const store = async (req, res) => {
  try {
    const categories = new Categories(req.body);
    await categories.save();
    return res.status(201).json(categories);
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

const update = async (req, res) => {
  try {
    const categories = await Categories.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    return res.status(201).json(categories);
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

const destroy = async (req, res) => {
  try {
    const categories = await Categories.findByIdAndDelete(req.params.id);
    return res.json(categories);
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