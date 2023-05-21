const Order = require("./orderModel");
const Cart = require("../cart/cartModel");
const defineAbilityFor = require("../../utils/roleAbilities");
const { subject } = require("@casl/ability");

const index = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const order = await Order.find().populate({
        path: "user",
        select: "_id full_name email",
      });
      return res.json(order);
    } else {
      const order = await Order.find({user: req.user._id})
      .populate({
        path: "user",
        select: "_id full_name email",
      });
      return res.json(order);
    }
  } catch (error) {
    return res.status(500).json(error);
  }
}

const store = async (req, res, next) => {
  try {
    let order = {};
    
    const cart = await Cart.findOne({user: {_id: req.user._id}})    
    .populate({
      path: "products.product",
      select: "-__v -category -tags -createdAt -updatedAt -_id",
    });
    
    if (!cart) {
      return res.status(404).json({
        code: 404,
        error: "Not Found",
        message: "Cart tidak ditemukan. Harap masukkan product ke dalam cart terlebih dahulu",
      });
    }

    const productsId = [];
    cart.products.forEach(element => {
      productsId.push(element.product._id);
    });

    const products_snapshot = []
    cart.products.forEach((element, index) => {
      products_snapshot[index] = {
        name: element.product.name,
        description: element.product.description,
        price: element.product.price,
        image_url: element.product.image_url,
        quantity: element.quantity,
      };
    });

    order = {
      user: req.user._id,
      cart: cart._id,
      products_snapshot,
      delivery_address: req.body.delivery_address,
      total_quantity: 0,
      total_price: 0, 
    };
    
    cart.products.forEach(element => {
      order.total_quantity += element.quantity;
      order.total_price += element.product.price * element.quantity;
    });

    const insertedOrder = new Order(order);
    await insertedOrder.save();
    return res.status(201).json(insertedOrder);
    
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
};

const update = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      {_id: req.params.id}, 
      {delivery_status: req.body.delivery_status}, 
      {
        new: true,
        runValidators: true,
      }
    );
    return res.status(201).json(order);
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
  const order = await Order.findById(req.params.id);
  const orderSubject = subject("Order", {user_id: order.user.toString()});
  const orderPolicy = defineAbilityFor(req.user);

  if (!orderPolicy.can("delete", orderSubject)) {
    return res.status(403).json({
      code: 403,
      error: "Forbidden",
      message: "Anda tidak memiliki akses delete untuk Order ini",
    });
  }

  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    res.json(order);
  } catch (error) {
    res.status(500).json(error);
  }
}

module.exports = {
  index,
  store,
  update,
  destroy,
}