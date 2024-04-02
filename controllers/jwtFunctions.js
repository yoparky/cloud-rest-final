'use strict';
// Authenticate HTTP requests based on JWT
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const config = require('../config');

const DOMAIN = config.DOMAIN;
const CLIENT_ID = config.CLIENT_ID;
const CLIENT_SECRET = config.CLIENT_SECRET;

// req.user filled if validated, req.user.sub contains unique identifier for user after valdiation
const checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${DOMAIN}/.well-known/jwks.json`
    }),
  
    // Validate that sha256 signature from Auth0 matches public key from issuer on token
    issuer: `https://${DOMAIN}/`,
    algorithms: ['RS256'],
    // If its false, continue to the next middleware if the request does not contain a token instead of failing
    // if jwt is invalid or missing, req.user will be undefined
    credentialsRequired: false
  });

module.exports = {
    checkJwt
};