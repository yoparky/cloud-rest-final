'use strict';

const express = require('express');
const app = express();
const conf = require('./config');

const { Datastore } = require('@google-cloud/datastore');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const eh = require('express-handlebars');
app.engine('handlebars', eh.engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// JWT
const { auth } = require('express-openid-connect');
const config = {
    authRequired: false,
    auth0Logout: true,
    baseURL: `https://${conf.DOMAIN}`,
    clientID: conf.CLIENT_ID,
    issuerBaseURL: `https://${conf.ISSUER_BASE_URL}`,
    secret: conf.CLIENT_SECRET
}
// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));


// routes for login, logout, view id_token
const { requiresAuth } = require('express-openid-connect');

app.get('/profile', requiresAuth(), (req, res) => {
    res.render('token-login');
});

app.post('/submit', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    var options = { method: 'POST',
            url: `https://${conf.DOMAIN}/oauth/token`,
            headers: { 'content-type': 'application/json' },
            body:
             { grant_type: 'password',
               username: username,
               password: password,
               client_id: conf.CLIENT_ID,
               client_secret: conf.CLIENT_SECRET },
            json: true };
    request(options, (error, response, body) => {
        if (error){
            res.status(500).send(error);
        } else {
            const info = {};
            info.access_token = body.access_token;
            info.id_token = body.id_token;
            res.render('info', info);
        }
    });
  });

app.get('/', (req, res) => {
    req.oidc.isAuthenticated() ? res.render('home') : res.redirect('/login');

});

const login = express.Router();

login.post('/', function(req, res){
    const username = req.body.username;
    const password = req.body.password;
    var options = { method: 'POST',
            url: `https://${conf.DOMAIN}/oauth/token`,
            headers: { 'content-type': 'application/json' },
            body:
             { grant_type: 'password',
               username: username,
               password: password,
               client_id: conf.CLIENT_ID,
               client_secret: conf.CLIENT_SECRET },
            json: true };
    request(options, (error, response, body) => {
        if (error){
            res.status(500).send(error);
        } else {
            res.send(body);
        }
    });

});

app.use('/login', login);
// routes for login, logout, view id_token END

// REST API
app.use(`/loads`, require('./routes/api/load.js'));
app.use(`/boats`, require('./routes/api/boat.js'));
// https
app.enable('trust proxy');

if (module === require.main) {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}...`);
    });
}
module.exports = app;