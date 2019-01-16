const User = require('../models/user');
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

}
