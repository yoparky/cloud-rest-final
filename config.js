'use strict';

const { Datastore } = require('@google-cloud/datastore');

const BASE_URL = 'localhost:8080';
const CLIENT_ID = 'JZBeYH3V7nHdytXRUmGwW2LBAM3drz0c';
const CLIENT_SECRET = '-csAtJQ7PIkfTYik43znDp0-PTRVa6dGqCjuik7btGju6uuowUzCjUz8D5ErrTzf';
const DOMAIN = 'a9-493final.us.auth0.com';
const datastore = new Datastore({
    projectId: 'a9-portfolio',
  });
const LOAD = "Load";
const BOAT = "Boat";
const USER = "User";

module.exports = {
    DOMAIN: DOMAIN,
    CLIENT_ID: CLIENT_ID,
    CLIENT_SECRET: CLIENT_SECRET,
    BASE_URL: BASE_URL,
    datastore: datastore,
    LOAD: LOAD,
    BOAT: BOAT,
    USER: USER
}