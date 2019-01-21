const express = require('express');
const router = express.Router();
const utils = require('../utils');

// active person sends background location updates here
router.post('/update', (req, res) => {
 utils.updateLocation({ // save location to db
   uuid: req.body.uuid,
   lat: req.body.lat,
   long: req.body.long,
 })
 // update responder ?
})

// unsafe person sends background location updates here
router.post('/llamaUpdate', (req, res) => {
 const llama = { long: req.body.long, lat: req.body.lat, uuid: req.body.uuid };
 utils.updateLocation(llama); // save new location to db
 const io = req.io;
 io.sockets.in(req.body.uuid).emit('update_llama', llama);
 console.log('emitted unsafe person location update');
 res.status(200).send('unsafe update success');
})

module.exports = router;
