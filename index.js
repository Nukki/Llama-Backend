const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const apn = require('apn');
const mongoose = require('mongoose');

const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const port = process.env.PORT || 1337;

const router = require('./routes');
const socketSetup = require('./sockets');

// setup db
const mongo_url = process.env.MONGO_URI;
mongoose.connect(mongo_url, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

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

// setup sockets
io.on('connection', (socket) => {
  console.log("New connection " + socket.id);
  socket.emit('who_are_you');
  socketSetup(socket, io, apn, apnProvider);
});

// use JSON parsing middleware
app.use(bodyParser.urlencoded({extended: true}))
   .use(bodyParser.json());

// make variables available to router
app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use('/user', router);
app.get('/', (req, res) => {
  console.log('route: / was hit')
  res.status(200).send('Hello');
})

// error handling
app.use((err, req, res, next) => {
  console.log(err)
  res.status(err.status || 500).send(err.message || 'Internal server error.');
});
app.use((req, res) => {
  res.sendStatus(404);
});

server.listen(port, () => {
  console.log(`Listening on ${port}`);
});
