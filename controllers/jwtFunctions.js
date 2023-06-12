'use strict';

// const { expressjwt: expressJwt } = require('express-jwt');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const config = require('../config');

const DOMAIN = config.DOMAIN;
const CLIENT_ID = config.CLIENT_ID;
const CLIENT_SECRET = config.CLIENT_SECRET;

const checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${DOMAIN}/.well-known/jwks.json`
    }),
  
    // Validate the audience and the issuer.
    issuer: `https://${DOMAIN}/`,
    algorithms: ['RS256'],
    // If its false, continue to the next middleware if the request does not contain a token instead of failing
    // if jwt is invalid or missing, req.user will be undefined
    credentialsRequired: false
  });

module.exports = {
    checkJwt
};