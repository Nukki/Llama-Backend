const mongoose = require('mongoose');

let personSchema = new mongoose.Schema({
  name: { type: String, required: true },
  uuid: { type: String, required: true },
  device_token: { type: String, required: true },
  active: { type: Boolean, required: true },
  isSafe: { type: Boolean, required: true },
  lat: { type: mongoose.Schema.Types.Decimal128, required: true },
  long: { type: mongoose.Schema.Types.Decimal128, required: true },
  picture: { type: String, required: false },
});

module.exports = mongoose.model('Person', personSchema);
