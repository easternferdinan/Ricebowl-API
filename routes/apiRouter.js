const router = require("express").Router();
const multer = require("multer");
const os = require("os");

const abilitiesAuthorization = require("../middlewares/abilitiesAuthorization");

const productsController = require("../app/products/productsController");
const categoriesController = require("../app/categories/categoriesController");
const tagsController = require("../app/tags/tagsController");
const addressesController = require("../app/delivery-addresses/addressesController");
const cartController = require("../app/cart/cartController");
const orderController = require("../app/order/orderController");
const invoiceController = require("../app/invoice/invoiceController");

// Products Router
router.get("/products", productsController.index);
router.post("/products", 
  abilitiesAuthorization("create", "Product"),
  multer({ dest: os.tmpdir() }).single("image"), 
  productsController.store
);
router.put("/products/:id", 
  abilitiesAuthorization("update", "Product"),
  multer({ dest: os.tmpdir() }).single("image"), 
  productsController.update
);
router.delete("/products/:id", 
  abilitiesAuthorization("delete", "Product"),
  productsController.destroy
);

// Categories Router
router.get("/categories", categoriesController.index);
router.post("/categories", 
  abilitiesAuthorization("create", "Category"),
  categoriesController.store
);
router.put("/categories/:id", 
  abilitiesAuthorization("update", "Category"),
  categoriesController.update
);
router.delete("/categories/:id", 
  abilitiesAuthorization("delete", "Category"),
  categoriesController.destroy
);

// Tags Router
router.get("/tags", tagsController.index);
router.post("/tags", 
  abilitiesAuthorization("create", "Tag"),
  tagsController.store
);
router.put("/tags/:id", 
  abilitiesAuthorization("update", "Tag"),
  tagsController.update
);
router.delete("/tags/:id", 
  abilitiesAuthorization("delete", "Tag"),
  tagsController.destroy
);

// Delivery Addresses Router
/*
  Field specific authorization is in effect for update and destroy controller.
  Such authorization is done inside the controller.
*/
router.get("/delivery-addresses",
  abilitiesAuthorization("read", "Delivery-Address"),
  addressesController.index
);
router.post("/delivery-addresses", 
  abilitiesAuthorization("create", "Delivery-Address"),
  addressesController.store
);
router.put("/delivery-addresses/:id", 
  addressesController.update
);
router.delete("/delivery-addresses/:id", 
  addressesController.destroy
);

// Cart Router
/* 
  Every controller filters the needed resource with user's id.
  So, field specific authorization such as the one in /delivery-addresses update and destroy controller 
  is considered as unnecessary.
*/
router.get("/cart", 
  abilitiesAuthorization("read", "Cart"),
  cartController.index
);
router.post("/cart",
  abilitiesAuthorization("create", "Cart"),
  cartController.store
);
router.delete("/cart",
  abilitiesAuthorization("delete", "Cart"),
  cartController.destroy
);

// Order Router
/*
  - The same as /cart, field specific authorization is not used, except for the destroy controller
  - Admin is the only one who's authorized to do an update, and it's only for delivery_status field
*/
router.get("/order", 
  abilitiesAuthorization("read", "Order"), 
  orderController.index
)
router.post("/order",
  abilitiesAuthorization("create", "Order"),
  orderController.store
);
router.put("/order/:id",
  abilitiesAuthorization("update", "Order"),
  orderController.update
);
router.delete("/order/:id",
  orderController.destroy
);

// Invoice Router
/*
  Field specific authorization is in effect
*/
router.get("/invoice/:id", // The id used here is order id
  invoiceController.index
);

module.exports = router;