// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
const SPOT_API_URL = 'https://api.spotify.com';
const { CLIENT_ID, PROJECT_DOMAIN } = process.env;
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

// parse application/json
// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.text({ type: 'text/html' }))

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

/**
 * Section 1:
 *   Forward requests to the Spotify API.
 */

const forwardRequestToSpotify = ({ originalUrl, method, headers: { authorization } }, responseType, overridePayload) => {
  const defaultPayload = { method, headers: { authorization } };
  const endpoint = SPOT_API_URL + originalUrl;
  const payload = Object.assign({}, defaultPayload, overridePayload);

  return fetch(endpoint, payload).then(res => responseType == 'json' ? res.json() : res.text());
};

// HTTP GET
app.get(`/v1/*`, (req, res) =>
  forwardRequestToSpotify(req, 'json')
    .then(json => res.json(json))
    .catch(err => res.status(500).json(err)));

// HTTP POST
app.post(`/v1/*`, (req, res) =>
  forwardRequestToSpotify(req, 'json', { body: JSON.stringify(req.body) })
    .then(json => res.json(json))
    .catch(err => res.status(500).json(err)));

// HTTP PUT
app.put(`/v1/*`, (req, res) =>
  forwardRequestToSpotify(req, 'json', { body: Object.keys(req.body).length ? JSON.stringify(req.body) : null })
    .then(json => res.json(json))
    .catch(err => res.status(500).json(err)));

// HTTP DELETE
app.delete(`/v1/*`, (req, res) =>
  forwardRequestToSpotify(req, 'text', { body: JSON.stringify(req.body) })
    .then(text => text.json({}))
    .catch(err => res.status(500).json(err)));

// // -------------------------------------------------------------//


// // init Spotify API wrapper
const SpotifyWebApi = require('spotify-web-api-node');

// // Replace with your redirect URI, required scopes, and show_dialog preference
const scopes = ['user-read-playback-state', 'playlist-modify-public', 'user-library-read', 'user-follow-read', 'user-modify-playback-state', 'streaming', 'user-read-birthdate', 'user-read-email', 'user-read-private'];

// // The API object we'll use to interact with the API
const spotifyApi = new SpotifyWebApi({
  clientId: CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: `https://${PROJECT_DOMAIN}/callback`,
});

app.get("/authorize", (request, response) => {
  response.redirect('https://accounts.spotify.com/authorize' +
  '?response_type=code' +
  '&client_id=' + CLIENT_ID +
  '&scope=' + encodeURIComponent(scopes) +
  '&redirect_uri=' + encodeURIComponent(redirectUri + 'callback'));
});


// // Exchange Authorization Code for an Access Token
app.get("/callback", (request, response) => {
  const authorizationCode = request.query.code;

  spotifyApi.authorizationCodeGrant(authorizationCode)
    .then((data) => {
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
