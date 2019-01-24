const utils = require('../utils');

module.exports = (socket, io, apn, apnProvider) => {

  socket.on('create_user', (user_object) => {
    console.log("Creating new user!")
    socket.emit('user_created', utils.createUser(user_object));
  });

  socket.on('active', (user_object) => {
    console.log("inside active, user is ", user_object);
    utils.setActiveStatus(user_object, true);
    utils.updateLocation(user_object);
    utils.getLlamas(user_object, (rooms) => {
      rooms.forEach((room) => {
        if (!(room.uuid in socket.rooms)) {
          socket.join(room.uuid);
          console.log(`socket ${socket.id} joined llama room ${room.uuid}`);
          const llama = {
            uuid: room.uuid,
            lat: `${room.lat}`,
            long: `${room.long}`,
            name: `${room.name}`
          }
          socket.emit('add_llama', llama);
          io.sockets.emit('new_responder');
        }
      })
    })
    if (!user_object.isSafe) {
      utils.getResponders(user_object, (responders) => {
        responders.forEach((re) => {
          if(!(re.uuid in socket.rooms)) {
            socket.join(re.uuid);
            console.log(`socket ${socket.id} joined responder room ${re.uuid}`);
            const resp = { uuid: re.uuid, lat: `${re.lat}`, long: `${re.long}`, name: `${re.name}` }
            socket.emit('add_responder', resp);
          }
        })
      })
    }
  });

  socket.on('not_active', (user_object) => {
    utils.setActiveStatus(user_object, false);
    // disappear from everyone's radar
    io.sockets.in(user_object.uuid).emit('clear', user_object.uuid);
    io.of('/').in(user_object.uuid).clients((err, clients) => {
      console.log(`Responder ${user_object.uuid} will disappear from ${clients}`);
      clients.forEach((c) => io.sockets.connected[c].leave(user_object.uuid));
    });
  });

  socket.on('notify', (llama) => {
    console.log(`user ${llama.uuid} needs help. coords: ${llama.lat} ${llama.long}`);
    utils.updateLocation(llama);
    utils.setSafeStatus(llama, false, () => {
      io.sockets.emit('new_llama', llama.uuid);
    });

    // token identifies a unique user with APNs
    utils.getRelevantTokens(llama.uuid, llama.lat, llama.long, (tokens) => {
      console.log("tokens in routes ", tokens);
      // configure a notification
      var noty = new apn.Notification();
      noty.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires
      noty.badge = 1;
      noty.sound = "ping.aiff";
      noty.alert = "OMG!!! Its a notification";
      noty.payload = {
        'messageFrom': 'super duper app'
      };
      noty.topic = process.env.APP_BUNDLE_ID;
      noty.body = 'Someone nearby needs help';

      // send Notification
      tokens.forEach((tkn) => {
        apnProvider.send(noty, tkn).then( (result) => {
          console.log(result);
        });
      })
    });
  });

  socket.on('imsafe', (llama) => {
    console.log('im safe');
    // disappear from other people's radars
    io.sockets.in(llama.uuid).emit('clear', llama.uuid);
    io.of('/').in(llama.uuid).clients((err, clients) => {
      console.log("Llama will disappear from ", clients);
      clients.forEach((c) => io.sockets.connected[c].leave(llama.uuid));
    });

    // leave all responder rooms, but not llamas
    console.log("Responders to leave", socket.rooms);
    Object.keys(socket.rooms).forEach((r) => {
      r && console.log("Will check status of ", r);
      if (r && r!== socket.id) { // if it's not me
        utils.personIsSafe(r, (isSafe) => {
          if(isSafe) {
            socket.leave(r);
            socket.emit('clear', r);
            console.log(`llama socket ${socket.id} leaving responder room ${r}`)
          }
          // socket.leave(r);
          // socket.emit('clear', r);
          // console.log(`llama socket ${socket.id} leaving responder room ${r}`)
        });
      }
    });
    utils.setSafeStatus(llama, true, () => {});
  });

  socket.on('update_location', (user_object) => {
    // let everyone listening in the room know
    io.sockets.in(user_object.uuid).emit('update', user_object);
    utils.updateLocation(user_object); // save new location to db
    console.log("=======sent out an update========");
  })

  socket.on('disconnect', () => {
    console.log(`socket ${socket.id} disonnected`);
  })
}
