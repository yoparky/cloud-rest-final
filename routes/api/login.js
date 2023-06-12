'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const loadController = require('../../controllers/userController');

const app = express();
app.use(bodyParser.json());
const router = express.Router();


router.post('/', function (req, res) {
    if (req.body.hasOwnProperty('uid')) {
        var uid = req.body.uid;
        loadController.post_user(uid)
            .then(key => {
                res.status(201).json(
                    {
                        "id": key.id,
                        "uid": uid,
                        "self": req.protocol + "://" + req.get("host") + req.baseUrl + "/" + key.id
                    }
                )
            });
    } else {
        res.status(400).json({"Error": "The request object is missing at least one of the required attributes"});
    }
});




//////////


router.get('/:load_id', function (req, res) {
    loadController.get_load(req.params.load_id)
    .then(load => {
        if (load[0] === undefined || load[0] === null) {
            // no load with id
            res.status(404).json({"Error": "No load with this load_id exists"});
        } else {
            // found load with id
            load[0].self = req.protocol + "://" + req.get("host") + req.baseUrl + "/" + req.params.load_id;
            res.status(200).json(load[0]);
        }
    })
});


router.get('/', function (req, res) {
    const loads = loadController.get_loads(req)
        .then((loads) => {
            res.status(200).json(loads);
        });
});

router.delete('/:load_id', function (req, res) {
    loadController.get_load(req.params.load_id)
        .then(async load => {
            if (load[0] === undefined || load[0] === null) {
                // no load with id
                res.status(404).json({"Error": "No load with this load_id exists"});
            } else {
                // found load with id
                await loadController.delete_load(req.params.load_id)
                    .then(res.status(204).end());
            }
        })
});

module.exports = router;