'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const loadController = require('../../controllers/loadController');
const boatController = require('../../controllers/boatController');

const app = express();
app.use(bodyParser.json());
const router = express.Router();

router.put('/', async function (req, res) {
    res.status(405).json({"Error": 'PUT and DELETE on whole database is not supported'});
});
router.delete('/', async function (req, res) {
    res.status(405).json({"Error": 'PUT and DELETE on whole database is not supported'});
});

router.post('/', function (req, res) {
    if (req.get('content-type') !== 'application/json') {
        res.status(415).json({"Error": 'Server only accepts application/json data'});
    } else if (!req.accepts(['application/json'])) {
        res.status(406).json({"Error": 'Server only responds in application/json data'});
    } else if (req.body.hasOwnProperty('volume') && req.body.hasOwnProperty('item') && req.body.hasOwnProperty('creation_date')) {
        var volume = req.body.volume;
        var item = req.body.item;
        var creation_date = req.body.creation_date;
        loadController.post_load(volume, item, creation_date)
            .then(key => {
                res.status(201).json(
                    {
                        "id": key.id,
                        "volume": volume,
                        "carrier": null,
                        "item": item,
                        "creation_date": creation_date,
                        "self": req.protocol + "://" + req.get("host") + req.baseUrl + "/" + key.id
                    }
                )
            });
    } else {
        res.status(400).json({"Error": "The request object is missing at least one of the required attributes"});
    }
});

router.get('/:load_id', function (req, res) {
    if (!req.accepts(['application/json'])) {
        res.status(406).json({"Error": 'Server only responds in application/json data'});
    }

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
    if (!req.accepts(['application/json'])) {
        res.status(406).json({"Error": 'Server only responds in application/json data'});
    }
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

// will reset carrier
router.put('/:load_id', function (req, res) {
    if (req.get('content-type') !== 'application/json') {
        res.status(415).json({"Error": 'Server only accepts application/json data'});
    } else if (!req.accepts(['application/json'])) {
        res.status(406).json({"Error": 'Server only responds in application/json data'});
    } else if (req.params.load_id === "null") {
        res.status(404).json({"Error": "No load with this load_id exists"});
    } else {
        loadController.get_load(req.params.load_id)
            .then(async load => {
                if (load[0] === undefined || load[0] === null) {
                    res.status(404).json({"Error": "No load with this load_id exists"});
                } else {
                    if (req.body.hasOwnProperty('volume') && req.body.hasOwnProperty('item') && req.body.hasOwnProperty('creation_date')) {
                        if (load[0].carrier !== null) {
                            await boatController.delete_load_from_boat(load[0].carrier.id, req.params.load_id);
                        }
                        var volume = req.body.volume;
                        var item = req.body.item;
                        var creation_date = req.body.creation_date;
                        loadController.put_load(req.params.load_id, volume, item, creation_date)
                            .then(key => {
                                const self = req.protocol + "://" + req.get("host") + req.baseUrl + "/" + req.params.boat_id;
                                res.location(self);
                                res.status(303).json(
                                    {
                                        "id": req.params.load_id,
                                        "volume": volume,
                                        "carrier": null,
                                        "item": item,
                                        "creation_date": creation_date,
                                        "self": req.protocol + "://" + req.get("host") + req.baseUrl + "/" + req.params.load_id
                                    }
                                );
                            });

                    } else {
                        res.status(400).json({"Error": "The request object is missing at least one of the required attributes"});
                    }
                }
            })
    }
});



router.patch('/:load_id', function (req, res) {
    if (req.get('content-type') !== 'application/json') {
        res.status(415).json({"Error": 'Server only accepts application/json data'});
    } else if (!req.accepts(['application/json'])) {
        res.status(406).json({"Error": 'Server only responds in application/json data'});
    } else if (req.params.load_id === "null") {
        res.status(404).json({"Error": "No load with this load_id exists"});
    } else if (req.body.hasOwnProperty('id')) {
        res.status(400).json({"Error": "load_id cannot be patched"});
    } else {
        loadController.get_load(req.params.load_id)
            .then(async load => {
                if (load[0] === undefined || load[0] === null) {
                    // no boat with id
                    res.status(404).json({"Error": "No load with this load_id exists"});
                } else {
                    if (load[0].carrier !== null) {
                        await boatController.delete_load_from_boat(load[0].carrier.id, req.params.load_id);
                    }
                    loadController.patch_load(req.params.load_id, req, load)
                    .then(async key => {
                        var self = req.protocol + "://" + req.get("host") + req.baseUrl + "/" + req.params.load_id;
                        res.location(self);
                        let load = await loadController.get_load(req.params.load_id);
                        load[0].self = self;
                        res.status(303).json(load[0]);
                    });
                    
                }
            })
    }
});

module.exports = router;