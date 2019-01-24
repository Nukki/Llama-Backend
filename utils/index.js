const Person = require('../models/person');
const uuidv4 = require('uuid/v4');

module.exports = {

  createUser: (user_object) => {
    const names = ['Nikki', 'Vicky', 'Ricky', 'Andre', 'Audrey'];
    let usr = new Person({
      name: names[Math.floor(Math.random() * 4)],
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
      if (err) return (err);
      usr.active = value;
      usr.save((err) =>  {
        if (err) {
          console.log("DB SAVE ERR ", err)
          return (err);
        }
      });
    });
  },

  setSafeStatus: (user_object, value, callback) => {
    Person.findOne({ 'uuid': user_object.uuid }, (err, usr) => {
      if (err) return (err);
      usr.isSafe = value;
      usr.save((err) =>  {
        if (err) {
          console.log("DB SAVE ERR ", err)
          return (err);
        }
        callback();
      });
    });
  },

  personIsSafe: (uuid, callback) => {
    Person.findOne({ 'uuid': uuid }, (err, usr) => {
      if (err) return (err);
      console.log("returning person safe status");
      callback(usr.isSafe);
    });
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
    });
  },

  getRelevantTokens: (uuid, lat, long, callback) => {
    Person.find({ 'active': true, isSafe: true }, (err, usrs) => {
      const usrsCloseby = usrs.filter((usr) => (
        usr.lat <= lat + 0.01 && usr.lat > lat - 0.01 ) && (
        usr.long <= long + 0.015 && usr.long > long - 0.015) && (
        usr.uuid !== uuid
      ));
      const tokens = usrsCloseby.map((usr) => usr.device_token );
      callback(tokens);
    });
  },

  getLlamas: (user_obj, callback) => {
    console.log("getting the llamas");
    Person.find({ 'isSafe' : false }, (err, users) => {
      const llamasNearby = users.filter((u) => (
        u.lat <= user_obj.lat + 0.01 && u.lat > user_obj.lat - 0.01 ) && (
        u.long <= user_obj.long + 0.015 && u.long > user_obj.long - 0.015) && (
        u.uuid !== user_obj.uuid
      ));
      callback(llamasNearby);
    });
  },

  getResponders: (user_obj, callback) => {
    console.log("getting the responders rooms");
    Person.find({ 'active': true, 'isSafe' : true }, (err, users) => {
      const responders = users.filter((r) => (
        r.lat <= user_obj.lat + 0.01 && r.lat > user_obj.lat - 0.01 ) && (
        r.long <= user_obj.long + 0.015 && r.long > user_obj.long - 0.015) && (
        r.uuid !== user_obj.uuid
      ));
      callback(responders);
    })
  },
}
