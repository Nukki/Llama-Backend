const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const apn = require('apn');

const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const port = process.env.PORT || 1337;
const uuidv4 = require('uuid/v4');
const mongoose = require('mongoose');
const User = require('./models/user');

// setup db
let mongo_url = process.env.MONGO_URI;
mongoose.connect(mongo_url, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// setup sockets
io.on('connection', (socket) => {
  console.log("Ayyyy someone connected!!!!!" + socket.id)
  const arr = [ { name: 'Jackie', long: Math.random(), lat: Math.random(), uuid: '3'},];
  socket.emit('update', arr);
  console.log('emitted location update');

  socket.on('create_user', (user_object) => {
    console.log("Creating new user!")
    socket.emit('user_created', { name: 'Friendly Llama', uuid: uuidv4() })
  })
  socket.on('disconnect', () => {
    console.log(`socket ${socket.id} disonnected`);
  })
});

// set up APNs
const options = {
  token: {
    key: process.env.APNS_CERT,
    keyId: process.env.KEY_ID,
    teamId: process.env.TEAM_ID
  },
  production: false
};
const apnProvider = new apn.Provider(options);
console.log(options.token.keyId)


// set up express server
app.use(bodyParser.urlencoded({extended: true}))
   .use(bodyParser.json());
app.use(express.static(path.join('public')));

app.get('/', (req, res) => {
  console.log('route: / was hit')
  res.status(200).send('Hello');
})

//test db
app.post('/user', (req, res) => {
    let usr = new User(
        {
            name: req.body.name,
            uuid: req.body.uuid,
            device_token: req.body.device_token,
            active: true,
            lat: req.body.lat,
            long: req.body.long,
        }
    );

    usr.save((err) =>  {
        if (err) {
            return next(err);
        }
        res.send('User Created successfully')
    })
})

// starts a socket room for geofencing and location sharing
// device_token, long, lat will be in req.body
app.post('/notify', (req, res) => {
  const device_token = req.body.device_token;
  const long = req.body.long;
  const lat = req.body.lat;
  // console.log('token: ' + device_token);
  // console.log('long: ' + long);
  // console.log('lat: ' + lat);

  // configure a notification
  var noty = new apn.Notification();
  noty.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
  noty.badge = 1;
  noty.sound = "ping.aiff";
  noty.alert = "OMG!!! Its a notification";
  noty.payload = {
    'messageFrom': 'super duper app'
  };
  noty.topic = process.env.APP_BUNDLE_ID;
  // noty.body = 'OMG!!! Its a notification';

  // send Notification
  apnProvider.send(noty, device_token).then( (result) => {
    // see documentation for an explanation of result
    console.log(result);
  });
  res.status(200).send('I see you need a notification');
})

// unsafe person sends location updates here
app.post('/update', (req, res) => {
 // will emit socket channel 'update' event and new coords
})

// closes the socket room with location sharing
app.post('/imsafe', (req, res) => {
  console.log('im safe')
})

// error handling
app.use((err, req, res, next) => {
  console.log(err)
  res.status(err.status || 500).send(err.message || 'Internal server error.');
});
app.use((req, res) => { 
  res.sendStatus(404);
});

// process.env.APP_BUNDLE_ID
// process.env.TEST_DEVICE_TOKEN

server.listen(port, () => {
  console.log(`Listening on ${port}`);
});
