const utils = require('../utils');

module.exports = (socket) => {
  socket.on('create_user', (user_object) => {
    console.log("Creating new user!")
    socket.emit('user_created', utils.createUser(user_object));
  });
  socket.on('active', (user_object) => {
    console.log("inside active");
    utils.setActiveStatus(user_object, true);
    utils.updateLocation(user_object);
    utils.getRoomsToJoin(user_object, (roomNames) => {
      roomNames.forEach((room) => {
        socket.join(room);
        console.log(`socket ${socket.id} joined room ${room}`);
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
