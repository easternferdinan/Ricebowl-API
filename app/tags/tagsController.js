const Tags = require("./tagsModel");

const index = async (req, res) => {
  try {
    const tags = await Tags.find();
    return res.json(tags);
  } catch (error) {
    return res.status(500).json(error);
  }
}

const store = async (req, res) => {
  try {
    const tags = new Tags(req.body);
    await tags.save();
    return res.status(201).json(tags);
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
    const tags = await Tags.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    return res.status(201).json(tags);
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
    const tags = await Tags.findByIdAndDelete(req.params.id);
    return res.json(tags);
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