'use strict';

const express = require('express');
const app = express();
const conf = require('./config');
const userController = require('./controllers/userController');

const { Datastore } = require('@google-cloud/datastore');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const eh = require('express-handlebars');
app.engine('handlebars', eh.engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

const request = require('request');

// JWT
const { auth } = require('express-openid-connect');
const config = {
    authRequired: false,
    auth0Logout: true,
    // check for http when using localhost
    baseURL: `${conf.BASE_URL}`,
    clientID: conf.CLIENT_ID,
    issuerBaseURL: `https://${conf.DOMAIN}`,
    secret: conf.CLIENT_SECRET
}
// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));


// routes for login, logout, view id_token
const { requiresAuth } = require('express-openid-connect');

app.get('/', async (req, res) => {
    // Auth0 middleware to check logged in status
    if (req.oidc.isAuthenticated()) {
        const sub = req.oidc.user.sub;
        const checkDup = await userController.get_user(sub);
        
        
        console.log(checkDup);
        // Check if the user is in DB and if not, add user with uid=sub
        if (checkDup.length === 0) {
            userController.post_user(sub, req.oidc.user.nickname);
        }
        // console.log(req.oidc.idToken);
        res.render('home', {nickname: req.oidc.user.nickname, jwt: req.oidc.idToken, uid: sub});
    } else {
        res.render('prelogin');
    }
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/api-docs', (req, res) => {
    res.render('api-docs');
});
// REST API
app.use(`/loads`, require('./routes/api/load.js'));
app.use(`/boats`, require('./routes/api/boat.js'));
app.use(`/users`, require('./routes/api/user.js'));

// https
app.enable('trust proxy');

if (module === require.main) {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}...`);
    });
}
module.exports = app;