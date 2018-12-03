const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const apn = require('apn');

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

app.get('/', (req, res) => {
  console.log('route: / was hit')
  res.status(200).send('Hello');
})

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


// error handling
app.use((err, req, res, next) => {
  console.log(err)
  res.status(err.status || 500).send(err.message || 'Internal server error.');
});
app.use((req, res) => {
  res.sendStatus(404);
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Express server listening on port 3000`);
});

// process.env.APP_BUNDLE_ID
// process.env.TEST_DEVICE_TOKEN
