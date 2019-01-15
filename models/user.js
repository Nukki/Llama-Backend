const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  uuid: { type: String, required: true },
  device_token: { type: String, required: true },
  active: { type: Boolean, required: true},
  lat: { type: mongoose.Schema.Types.Decimal128, required: true },
  long: { type: mongoose.Schema.Types.Decimal128, required: true },
});

module.exports = mongoose.model('User', userSchema);
