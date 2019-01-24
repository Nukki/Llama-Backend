const express = require('express');
const router = express.Router();

// background location updates will be sent here
router.post('/update', (req, res) => {
 const person = { long: req.body.long, lat: req.body.lat, uuid: req.body.uuid };
 utils.updateLocation({ // save location to db
   uuid: person.uuid,
   lat: person.lat,
   long: person.long,
 })
  const io = req.io;
  io.sockets.in(person.uuid).emit('update_llama', person);
})

module.exports = router;
