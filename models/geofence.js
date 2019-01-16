const mongoose = require('mongoose');

let geofenceSchema = new mongoose.Schema({
  name: { type: String, required: true }, // uuid of person in trouble
  lat: { type: mongoose.Schema.Types.Decimal128, required: true },
  long: { type: mongoose.Schema.Types.Decimal128, required: true },
});

module.exports = mongoose.model('Geofence', geofenceSchema);
