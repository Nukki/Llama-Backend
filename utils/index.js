const User = require('../models/user');
const Person = require('../models/person');
const Geofence = require('../models/geofence');
const uuidv4 = require('uuid/v4');

module.exports = {

  createUser: (user_object) => {
    let usr = new Person({
      name: "Friendly Llama",
      uuid: uuidv4(),
      device_token: user_object.device_token,
      active: true,
      isSafe: true,
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
    Person.findOne({ 'uuid': user_object.uuid }, (err, usr) => {
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

  setSafeStatus: (user_object, value, callback) => {
    Person.findOne({ 'uuid': user_object.uuid }, (err, usr) => {
      if (err) return (err);//handleError(err);
      usr.isSafe = value;
      usr.save((err) =>  {
        if (err) {
          console.log("DB SAVE ERR ", err)
          return (err);
        }
        callback();
      });
    })
  },


  updateLocation: (user_object) => {
    Person.findOne({ 'uuid': user_object.uuid }, (err, usr) => {
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

  getRelevantTokens: (uuid, lat, long, callback) => {
    Person.find({ 'active': true, isSafe: true }, (err, usrs) => {
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

  getLlamas: (user_obj, callback) => {
    console.log("getting the llamas");
    Person.find({ 'isSafe' : false }, (err, users) => {
      const llamasNearby = users.filter((u) => (
        u.lat <= user_obj.lat + 0.2 && u.lat > user_obj.lat - 0.2 ) && (
        u.long <= user_obj.long + 0.2 && u.long > user_obj.long - 0.2) && (
        u.uuid !== user_obj.uuid
      ));
      callback(llamasNearby);
    })
  },

  getResponders: (user_obj, callback) => {
    console.log("getting the responders rooms");
    Person.find({ 'active': true, 'isSafe' : true }, (err, users) => {
      const responders = users.filter((r) => (
        r.lat <= user_obj.lat + 0.2 && r.lat > user_obj.lat - 0.2 ) && (
        r.long <= user_obj.long + 0.2 && r.long > user_obj.long - 0.2) && (
        r.uuid !== user_obj.uuid
      ));
      callback(responders);
    })
  },
}
