const utils = require('../utils');

module.exports = (socket, io) => {
  socket.on('create_user', (user_object) => {
    console.log("Creating new user!")
    socket.emit('user_created', utils.createUser(user_object));
  });
  socket.on('active', (user_object) => {
    console.log("inside active");
    utils.setActiveStatus(user_object, true);
    utils.updateLocation(user_object);
    utils.getRoomsToJoin(user_object, (rooms) => {
      rooms.forEach((room) => {
        if (!(room.name in socket.rooms)) {
          socket.join(room.name);
          console.log(`socket ${socket.id} joined room ${room.name}`);
          const llama = { uuid: room.name, lat: `${room.lat}`, long: `${room.long}` }
          socket.emit('add_llama', llama);
        }
      })
    })
  });
  socket.on('not_active', (user_object) => {
    utils.setActiveStatus(user_object, false);
  });
  socket.on('disconnect', () => {
    console.log(`socket ${socket.id} disonnected`);
  })
}
