const { AbilityBuilder, createMongoAbility } = require("@casl/ability"); 

function defineAbilityFor(user = {}) {
  const { can, build } = new AbilityBuilder(createMongoAbility);

  console.log("ability ", user._id)

  if (user.role === "user") {
    can("create", "Cart");
    can("read", "Cart");
    can("delete", "Cart");
    can("create", "Order");
    can("read", "Order");
    can("delete", "Order", {user_id: user._id});
    can("read", "Delivery-Address");
    can("create", "Delivery-Address");
    can("delete", "Delivery-Address", {user_id: user._id});
    can("update", "Delivery-Address", {user_id: user._id});
    can("read", "Invoice", {user_id: user._id});
  } else if (user.role === "admin") {
    can("manage", "all");
  } else {
    can("read", "Product");
  }

  return build();
}

module.exports = defineAbilityFor;