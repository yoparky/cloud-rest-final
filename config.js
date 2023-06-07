'use strict';

const { Datastore } = require('@google-cloud/datastore');

const DOMAIN = 'a7-jwt.us.auth0.com';
const CLIENT_ID = 'Flobmhc4jGDbDWLJIJ69eVBI8KBibOMg';
const CLIENT_SECRET = 'vItKIt4yrqz056QeeTSixSdmqw4a652nEl3_haDZqVMJfQ6ZfmQ2mb4aZJVwVlpJ';
const ISSUER_BASE_URL = 'a7-jwt.us.auth0.com';
const datastore = new Datastore({
    projectId: 'a9-portfolio',
  });
const LOAD = "Load";
const BOAT = "Boat";

module.exports = {
    DOMAIN: DOMAIN,
    CLIENT_ID: CLIENT_ID,
    CLIENT_SECRET: CLIENT_SECRET,
    ISSUER_BASE_URL: ISSUER_BASE_URL,
    datastore: datastore,
    LOAD: LOAD,
    BOAT: BOAT
}