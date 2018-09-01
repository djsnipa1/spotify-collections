// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
const SPOTI_URL = '/v1/';
const SPOT_API_URL = 'https://api.spotify.com';
const CLIENT_ID = process.env.PUBLIC_KEY;
const fetch = require('node-fetch');

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('dist'));

app.use(`${SPOTI_URL}*`, (request, response) => {
  fetch(`${SPOT_API_URL}${request.originalUrl}`, {headers: {authorization: request.headers.authorization}}).then((res) => res.json()).then((res) => {
    response.json(res);
  });
});


// // -------------------------------------------------------------//


// // init Spotify API wrapper
const SpotifyWebApi = require('spotify-web-api-node');

// // Replace with your redirect URI, required scopes, and show_dialog preference
const redirectUri = 'http://localhost:3000/';
const scopes = ['user-read-playback-state', 'playlist-modify-public', 'user-library-read', 'user-follow-read', 'user-modify-playback-state', 'streaming', 'user-read-birthdate', 'user-read-email', 'user-read-private'];
// const showDialog = true;

// // The API object we'll use to interact with the API
const spotifyApi = new SpotifyWebApi({
  clientId: CLIENT_ID,
  clientSecret: process.env.PRIVATE_KEY,
  redirectUri: `${redirectUri}callback`,
});

app.get("/authorize", (request, response) => {
  response.redirect('https://accounts.spotify.com/authorize' +
  '?response_type=code' +
  '&client_id=' + CLIENT_ID +
  (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
  '&redirect_uri=' + encodeURIComponent(redirectUri + 'callback'));
});


// // Exchange Authorization Code for an Access Token
app.get("/callback", (request, response) => {
  const authorizationCode = request.query.code;

  spotifyApi.authorizationCodeGrant(authorizationCode)
    .then((data) => {
      console.log(data);
      response.redirect(`/auth/callback#access_token=${data.body.access_token}&refresh_token=${data.body.refresh_token}&expires_in=${data.body.expires_in}`);
    }, (err) => {
      console.log('Something went wrong when retrieving the access token!', err.message);
    });
});

// // -------------------------------------------------------------//

// listen for requests :)

// http://expressjs.com/en/starter/basic-routing.html
app.get("/*", (request, response) => {
  response.sendFile(`${__dirname }/views/index.html`);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`Your app is listening on port ${ listener.address().port}`);
});
