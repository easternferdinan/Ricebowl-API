const Cart = require("./cartModel");

const index = async (req, res) => {
  try {
    const cart = await Cart.findOne({user: req.user._id})
    .select("-__v")
    .populate({
      path: "user",
      select: "-__v -password -role -token -createdAt -updatedAt"
    })
    .populate({
      path: "products.product",
      select: "-__v -category -tags -createdAt -updatedAt",
    })
    .sort("products.product.-createdAt");
    return res.json(cart);
  } catch (error) {
    return res.status(500).json(error);
  }
}

/*
 In order to make it simpler and minimizing the possibility of cart and cart item duplication,
 store and update controller is merged into one.
*/
const store = async (req, res) => {
  const items = req.body;
  try {
    let cart = {
      user: req.user._id,
      products: [...items],
    };

    const insertedCart = await Cart.findOneAndUpdate({user: req.user._id}, cart, {
      new: true,
      upsert: true
    });
    return res.status(201).json(insertedCart);
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
    const cart = await Cart.findOneAndDelete({user: req.user._id});
    return res.json(cart);
  } catch (error) {
    return res.status(500).json(error);
  }
}

module.exports = {
  index,
  store,
  destroy,
}