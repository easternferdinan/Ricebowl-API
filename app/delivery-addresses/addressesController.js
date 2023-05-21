const { subject } = require("@casl/ability");
const defineAbilityFor = require("../../utils/roleAbilities");
const Addresses = require("./addressesModel");
const ObjectId = require("mongoose").Types.ObjectId;

const index = async (req, res) => {
  try {
    const addresses = await Addresses.find({userId: new ObjectId(req.user._id)});
    return res.json(addresses);
  } catch (error) {
    return res.status(500).json(error);
  }
}

const store = async (req, res) => {
  try {
    const address = new Addresses({...req.body, userId: req.user._id});
    await address.save();
    return res.status(201).json(address);
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
    const address = await Addresses.findById(req.params.id);
    console.log(address.userId.toString());
    const addressSubject = subject("Delivery-Address", {user_id: address.userId.toString()});
    const addressPolicy = defineAbilityFor(req.user);

    if (!addressPolicy.can("update", addressSubject)) {
      return res.status(403).json({
        code: 403,
        error: "Forbidden",
        message: "Anda tidak memiliki akses update untuk Delivery-Address ini",
      });
    }

    const updateAddress = await Addresses.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    return res.status(201).json(updateAddress);

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

const destroy = async (req, res, next) => {
  try {
    const address = await Addresses.findById(req.params.id);
    const addressSubject = subject("Delivery-Address", {user_id: address.userId.toString()});
    const addressPolicy = defineAbilityFor(req.user);

    if (!addressPolicy.can("delete", addressSubject)) {
      return res.status(403).json({
        code: 403,
        error: "Forbidden",
        message: "Anda tidak memiliki akses delete untuk Delivery-Address ini",
      });
    }

    const deleteAddress = await Addresses.findByIdAndDelete(req.params.id);
    return res.json(deleteAddress);

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