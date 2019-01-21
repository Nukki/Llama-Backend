const express = require('express');
const router = express.Router();
const utils = require('../utils');

// starts a socket room for geofencing and location sharing
router.post('/notify', (req, res) => {
  const apn = req.apn;
  const apnProvider = req.apnProvider;
  const io = req.io;

  console.log(`user ${req.body.uuid} needs help. coords: ${req.body.lat} ${req.body.long}`);

  // update location
  // update safe status
  const llama = { long: req.body.long, lat: req.body.lat, uuid: req.body.uuid };
  utils.updateLocation(llama);
  utils.setSafeStatus(llama, false);
  // const roomName = utils.createRoom({
  //   uuid: req.body.uuid,
  //   lat: req.body.lat,
  //   long: req.body.long
  // });
  // broadcast to all connections about new room
  io.sockets.emit('new_llama');

  // send notifications to active users nearby
  // token identifies a unique user with APNs
  utils.getRelevantTokens(req.body.uuid, req.body.lat, req.body.long, (tokens) => {
    console.log("tokens in routes ", tokens);
    // configure a notification
    // var noty = new apn.Notification();
    // noty.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    // noty.badge = 1;
    // noty.sound = "ping.aiff";
    // noty.alert = "OMG!!! Its a notification";
    // noty.payload = {
    //   'messageFrom': 'super duper app'
    // };
    // noty.topic = process.env.APP_BUNDLE_ID;
    // // noty.body = 'Someone nearby needs help';
    //
    // // send Notification // TODO loop through tokens
    // apnProvider.send(noty, device_token).then( (result) => {
    //   // see documentation for an explanation of result
    //   console.log(result);
    // });
  });
  res.status(200).send('we were notified!');
})

// closes the socket room with location sharing
router.post('/imsafe', (req, res) => {
  console.log('im safe');
  const llama = { long: req.body.long, lat: req.body.lat, uuid: req.body.uuid };
  utils.setSafeStatus(llama, true);
  const io = req.io;
  // disappear from other people's radars
  io.sockets.in(req.body.uuid).emit('clear', req.body.uuid);
  io.of('/').in(req.body.uuid).clients((err, clients) => {
    console.log(clients);
    clients.forEach((c) => io.sockets.connected[c].leave(req.body.uuid));
  });
  // leave all responder rooms, but not llamas 
  res.send('You are safe! awesome!')
})

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
