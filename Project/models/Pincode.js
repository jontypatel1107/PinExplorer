const mongoose = require("mongoose");

const pincodeSchema = new mongoose.Schema({
  officeName: String,
  pincode: Number,
  officeType: String,
  deliveryStatus: String,
  divisionName: String,
  regionName: String,
  circleName: String,
  taluk: String,
  districtName: String,
  stateName: String,
});

pincodeSchema.index({ pincode: 1 });
pincodeSchema.index({ stateName: 1 });
pincodeSchema.index({ districtName: 1 });
pincodeSchema.index({ taluk: 1 });
pincodeSchema.index({ officeName: "text", taluk: "text", districtName: "text" });

module.exports = mongoose.model("Pincode", pincodeSchema);
