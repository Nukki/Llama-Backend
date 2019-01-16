const User = require('../models/user');
const Geofence = require('../models/geofence');
const uuidv4 = require('uuid/v4');

module.exports = {

  createUser: (user_object) => {
    let usr = new User({
      name: "Friendly Llama",
      uuid: uuidv4(),
      device_token: user_object.device_token,
      active: true,
      lat: user_object.lat,
      long: user_object.long,
    });
    usr.save((err) =>  {
      if (err) {
        console.log("DB SAVE ERR ", err)
        return (err);
      }
    });
    return usr;
  },

  setActiveStatus: (user_object, value) => {
    User.findOne({ 'uuid': user_object.uuid }, (err, usr) => {
      if (err) return (err);//handleError(err);
      usr.active = value;
      usr.save((err) =>  {
        if (err) {
          console.log("DB SAVE ERR ", err)
          return (err);
        }
      });
    })
  },

  updateLocation: (user_object) => {
    User.findOne({ 'uuid': user_object.uuid }, (err, usr) => {
      if (err) return (err);//handleError(err);
      usr.long = user_object.long;
      usr.lat = user_object.lat;
      usr.save((err) =>  {
        if (err) {
          console.log("DB SAVE ERR ", err)
          return (err);
        }
      });
    })
  },

  createRoom: (user_object) => {
    let room = new Geofence({
      name: user_object.uuid,
      lat: user_object.lat,
      long: user_object.long,
    })
    room.save((err) =>  {
      if (err) {
        console.log("DB SAVE ERR ", err)
        return (err);
      }
      return room.name;
    });
  },

  updateRoom: (roomName, lat, long ) => {
    Geofence.findOne({ 'name': roomName }, (err, room) => {
      if (err) return (err);
      room.long = long;
      room.lat = lat;
      room.save((err) =>  {
        if (err) {
          console.log("DB SAVE ERR ", err)
          return (err);
        }
      });

    })
  },

  removeRoom: (name) => {
    Geofence.deleteOne({ name: name }, (err) => {
      if (err) return (err);
    })
  },

  getRelevantTokens: (uuid, lat, long, callback) => {
    const tokens = [];
    User.find({ 'active': true }, (err, usrs) => {
      const usrsCloseby = usrs.filter((usr) => (
        usr.lat <= lat + 0.2 && usr.lat > lat - 0.2 ) && (
        usr.long <= long + 0.2 && usr.long > long - 0.2) && (
        usr.uuid !== uuid
      ));
      // console.log("gud usrs", usrsCloseby);
      const tokens = usrsCloseby.map((usr) => usr.device_token );
      callback(tokens);
    })
  },

  getRoomsToJoin: (user_obj, callback) => {
    Geofence.find({}, (err, rooms) => {
      const roomsNearby = rooms.filter((room) => (
        room.lat <= user_obj.lat + 0.2 && room.lat > user_obj.lat - 0.2 ) && (
        room.long <= user_obj.long + 0.2 && room.long > user_obj.long - 0.2) && (
        room.name !== user_obj.uuid
      ));
      let names = roomsNearby.map((rm) => rm.name );
      callback(names);
    })
  },
}
