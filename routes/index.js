const express = require('express');
const router = express.Router();
const utils = require('../utils');
const User = require('../models/user');

// active person sends location updates here
router.post('/update', (req, res) => {
 // will save location to db
})

// starts a socket room for geofencing and location sharing
router.post('/notify', (req, res) => {
  const apn = req.apn;
  const apnProvider = req.apnProvider;
  const io = req.io;

  console.log(`user ${req.body.uuid} needs help. coords: ${req.body.lat} ${req.body.long}`);
  const roomName = utils.createRoom({
    uuid: req.body.uuid,
    lat: req.body.lat,
    long: req.body.long
  });

  // send notifications to active users nearby
  // token identifies a unique user with APNs
  utils.getRelevantTokens(req.body.lat, req.body.long, (tokens) => {
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

// unsafe person sends location updates here
router.post('/roomUpdate', (req, res) => {
 // will emit socket channel 'update' event and new coords
 // save new location to db
 const io = req.io;
 const arr = [ { name: req.body.name, long: req.body.long, lat: req.body.lat, uuid: req.body.uuid},];
 io.sockets.emit('update', arr);
 console.log('emitted unsafe person location update');
 res.status(200).send('unsafe update success');
})

// closes the socket room with location sharing
router.post('/imsafe', (req, res) => {
  console.log('im safe');
  utils.removeRoom(req.body.uuid);
  res.send('You are safe! awesome!')
})


module.exports = router;
