const Order = require("../order/orderModel");
const defineAbilityFor = require("../../utils/roleAbilities");
const { subject } = require("@casl/ability");

const index = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    .populate({
      path: "user",
      select: "full_name email _id"
    })
    .populate({
      path: "delivery_address",
      select: "-createdAt -updatedAt -__v -userId"
    });

    if (!order) {
      return res.status(404).json({
        code: 404,
        error: "Not Found",
        message: "Invoice can't be generated because the order id is not found"
      });
    }

    const invoiceSubject = subject("Invoice", {user_id: order.user._id});
    const invoicePolicy = defineAbilityFor(req.user);
  
    if (!invoicePolicy.can("read", invoiceSubject)) {
      return res.status(403).json({
        code: 403,
        error: "Forbidden",
        message: "Anda tidak memiliki akses read untuk Invoice ini",
      });
    }
    
    let invoiceVariables = {
      buyer: order.user.full_name,
      orderDate: order.createdAt.toDateString(),
      deliveryAddress: order.delivery_address,
      items: order.products_snapshot,
      totalPrice: order.total_price
    }

    // Generate invoiceNumber
    // Format: INV/"last-5-user-id""last-5-order-id"/order-creation-date
    invoiceVariables.invoiceNumber = 
      "INV/"
      + order.user._id.toString().slice(-5) 
      + order._id.toString().slice(-5) 
      + "/" 
      + order.createdAt.toISOString().split("T")[0].split("-").join("");

    return res.render("invoice", invoiceVariables);
  } catch (error) {
    return res.status(500).json(error);
  }
};

module.exports = {
  index,
}