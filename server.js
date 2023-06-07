'use strict';

const express = require('express');
const app = express();

const { Datastore } = require('@google-cloud/datastore');
const bodyParser = require('body-parser');

app.use(bodyParser.json());

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