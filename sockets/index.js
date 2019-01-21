const utils = require('../utils');

module.exports = (socket, io) => {

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
          const llama = { uuid: room.uuid, lat: `${room.lat}`, long: `${room.long}` }
          socket.emit('add_llama', llama);
        }
      })
    })
    if (!user_object.isSafe) {
      utils.getResponders(user_object, (responders) => {
        responders.forEach((re) => {
          if(!(re.uuid in socket.rooms)) {
            socket.join(re.uuid);
            console.log(`socket ${socket.id} joined responder room ${re.uuid}`);
            const resp = { uuid: re.uuid, lat: `${re.lat}`, long: `${re.long}` }
            socket.emit('add_responder', resp);
          }
        })
      })
    } // end if
  });

  socket.on('not_active', (user_object) => {
    utils.setActiveStatus(user_object, false);
    // disappear from everyone's radar
    io.sockets.in(user_object.uuid).emit('clear', user_object.uuid);
  });

  socket.on('disconnect', () => {
    console.log(`socket ${socket.id} disonnected`);
  })
}
