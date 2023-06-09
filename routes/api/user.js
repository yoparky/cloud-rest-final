'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const userController = require('../../controllers/userController');

const app = express();
app.use(bodyParser.json());
const router = express.Router();

router.put('/', async function (req, res) {
    res.status(405).json({"Error": 'PUT and DELETE on whole database is not supported'});
});
router.delete('/', async function (req, res) {
    res.status(405).json({"Error": 'PUT and DELETE on whole database is not supported'});
});
router.post('/', async function (req, res) {
    res.status(405).json({"Error": 'POST is not supported. Users are automatically added when signing up'});
});

router.get('/:user_id', function (req, res) {
    if (!req.accepts(['application/json'])) {
        res.status(406).json({"Error": 'Server only responds in application/json data'});
    }
    userController.get_user(req.params.user_id)
    .then(user => {
        if (user[0] === undefined || user[0] === null) {
            // no user with id
            res.status(404).json({"Error": "No user with this uid exists"});
        } else {
            // found user with id
            user[0].self = req.protocol + "://" + req.get("host") + req.baseUrl + "/" + req.params.user_id;
            res.status(200).json(user[0]);
        }
    })
});

router.get('/', function (req, res) {
    if (!req.accepts(['application/json'])) {
        res.status(406).json({"Error": 'Server only responds in application/json data'});
    }
    const users = userController.get_users(req)
        .then((users) => {
            res.status(200).json(users);
        });
});

module.exports = router;